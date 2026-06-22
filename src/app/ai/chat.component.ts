import { Component, DestroyRef, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { LocalizationService } from '../services/localization.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { AiProjectContextService } from '../services/ai-project-context.service';
import { ChatMessageFormatPipe } from '../shared/chat-message-format.pipe';
import { BoardService } from '../services/board.service';
import { CartService } from '../services/cart.service';
import { ListCartService } from '../services/list-cart.service';
import { ProjectRefreshService } from '../services/project-refresh.service';
import { ChatPanelService } from '../services/chat-panel.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CreationType = 'board' | 'list' | 'card';
type CreationStep =
  | 'boardName'
  | 'listBoard'
  | 'listName'
  | 'cardBoard'
  | 'cardList'
  | 'cardName'
  | 'cardDescription'
  | 'cardDueDate'
  | 'cardPriority'
  | 'cardStatus'
  | 'confirm';

interface PendingCreation {
  type: CreationType;
  step: CreationStep;
  data: Record<string, any>;
  context?: any;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, FormsModule, TranslatePipe, ChatMessageFormatPipe]
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @Input() showFab: boolean = true;

  messages: { role: 'user' | 'ai', text: string, isCopied?: boolean }[] = [];
  userInput: string = '';
  isOpen: boolean = false;
  isLoading: boolean = false;
  isProjectContextLoading: boolean = false;
  projectContextJson: string | null = null;
  pendingCreation: PendingCreation | null = null;

  constructor(
    private chatService: ChatService,
    private localization: LocalizationService,
    private projectContextService: AiProjectContextService,
    private boardService: BoardService,
    private listCartService: ListCartService,
    private cartService: CartService,
    private projectRefreshService: ProjectRefreshService,
    private chatPanelService: ChatPanelService,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.chatPanelService.toggle$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toggleChat());
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) this.scrollToBottom();
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', text });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    if (this.pendingCreation) {
      this.handleCreationAnswer(text);
      return;
    }

    const creationType = this.detectCreationType(text);
    if (creationType) {
      this.startCreationFlow(creationType);
      return;
    }

    const prompt = this.projectContextJson
      ? this.buildProjectPrompt(text)
      : text;

    this.chatService.askGemini(prompt).subscribe({
      next: (res) => {
        this.messages.push({ role: 'ai', text: res.text });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages.push({ role: 'ai', text: this.getChatErrorMessage(err) });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  loadProjectContext() {
    if (this.isProjectContextLoading) return;

    this.isProjectContextLoading = true;

    this.projectContextService.getProjectContext().subscribe({
      next: (context) => {
        this.projectContextJson = JSON.stringify(context, null, 2);
        this.isProjectContextLoading = false;
        this.messages.push({
          role: 'ai',
          text: this.localization.translate('chat.projectContextReady'),
        });
        this.scrollToBottom();
      },
      error: () => {
        this.isProjectContextLoading = false;
        this.messages.push({
          role: 'ai',
          text: this.localization.translate('chat.projectContextError'),
        });
        this.scrollToBottom();
      },
    });
  }

  copyToClipboard(msg: any) {
    navigator.clipboard.writeText(msg.text).then(() => {
      msg.isCopied = true; // Показуємо, що скопійовано
      setTimeout(() => msg.isCopied = false, 2000);
    });
  }

  private startCreationFlow(type: CreationType) {
    if (type === 'board') {
      this.pendingCreation = { type, step: 'boardName', data: {} };
      this.answer(this.t('chat.create.board.askName'));
      return;
    }

    this.projectContextService.getProjectContext().subscribe({
      next: (context) => {
        this.pendingCreation = {
          type,
          step: type === 'list' ? 'listBoard' : 'cardBoard',
          data: {},
          context,
        };

        if (!context.boards.length) {
          this.pendingCreation = null;
          this.answer(this.t('chat.create.noBoards'));
          return;
        }

        const boardNames = context.boards.map((board: any) => board.name).join(', ');
        this.answer(this.t(type === 'list' ? 'chat.create.list.askBoard' : 'chat.create.card.askBoard', { boards: boardNames }));
      },
      error: () => this.answer(this.t('chat.projectContextError')),
    });
  }

  private handleCreationAnswer(text: string) {
    const flow = this.pendingCreation;
    if (!flow) return;

    if (this.isCancel(text)) {
      this.pendingCreation = null;
      this.answer(this.t('chat.create.cancelled'));
      return;
    }

    switch (flow.step) {
      case 'boardName':
        flow.data['boardName'] = text;
        flow.step = 'confirm';
        this.answer(this.t('chat.create.board.confirm', { name: flow.data['boardName'] }));
        return;

      case 'listBoard': {
        const board = this.findBoard(flow.context, text);
        if (!board) {
          this.answer(this.t('chat.create.boardNotFound'));
          return;
        }
        flow.data['board'] = board;
        flow.step = 'listName';
        this.answer(this.t('chat.create.list.askName'));
        return;
      }

      case 'listName':
        flow.data['listName'] = text;
        flow.step = 'confirm';
        this.answer(this.t('chat.create.list.confirm', {
          list: flow.data['listName'],
          board: flow.data['board'].name,
        }));
        return;

      case 'cardBoard': {
        const board = this.findBoard(flow.context, text);
        if (!board) {
          this.answer(this.t('chat.create.boardNotFound'));
          return;
        }
        flow.data['board'] = board;
        flow.step = 'cardList';

        if (!board.lists?.length) {
          this.pendingCreation = null;
          this.answer(this.t('chat.create.card.noLists', { board: board.name }));
          return;
        }

        this.answer(this.t('chat.create.card.askList', {
          lists: board.lists.map((list: any) => list.name).join(', '),
        }));
        return;
      }

      case 'cardList': {
        const list = this.findList(flow.data['board'], text);
        if (!list) {
          this.answer(this.t('chat.create.listNotFound'));
          return;
        }
        flow.data['list'] = list;
        flow.step = 'cardName';
        this.answer(this.t('chat.create.card.askName'));
        return;
      }

      case 'cardName':
        flow.data['cardName'] = text;
        flow.step = 'cardDescription';
        this.answer(this.t('chat.create.card.askDescription'));
        return;

      case 'cardDescription':
        flow.data['description'] = this.isSkip(text) ? '' : text;
        flow.step = 'cardDueDate';
        this.answer(this.t('chat.create.card.askDueDate'));
        return;

      case 'cardDueDate': {
        const dueDate = this.parseDueDate(text);
        if (dueDate === undefined) {
          this.answer(this.t('chat.create.card.invalidDueDate'));
          return;
        }
        flow.data['dueDate'] = dueDate;
        flow.step = 'cardPriority';
        this.answer(this.t('chat.create.card.askPriority'));
        return;
      }

      case 'cardPriority': {
        const priority = this.parsePriority(text);
        if (priority === null) {
          this.answer(this.t('chat.create.card.invalidPriority'));
          return;
        }
        flow.data['priorityNote'] = priority;
        flow.step = 'cardStatus';
        this.answer(this.t('chat.create.card.askStatus'));
        return;
      }

      case 'cardStatus': {
        const status = this.parseStatus(text);
        if (status === null) {
          this.answer(this.t('chat.create.card.invalidStatus'));
          return;
        }
        flow.data['statusNote'] = status;
        flow.step = 'confirm';
        this.answer(this.t('chat.create.card.confirm', {
          card: flow.data['cardName'],
          board: flow.data['board'].name,
          list: flow.data['list'].name,
          priority: this.localization.enumLabel('priority', flow.data['priorityNote']),
          status: this.localization.enumLabel('status', flow.data['statusNote']),
        }));
        return;
      }

      case 'confirm':
        if (!this.isYes(text)) {
          this.pendingCreation = null;
          this.answer(this.t('chat.create.cancelled'));
          return;
        }
        this.createPendingEntity(flow);
        return;
    }
  }

  private createPendingEntity(flow: PendingCreation) {
    if (flow.type === 'board') {
      this.boardService.createBoard({ name: flow.data['boardName'] }).subscribe({
        next: () => {
          this.projectRefreshService.notify({ type: 'board-created' });
          this.finishCreation(this.t('chat.create.board.success', { name: flow.data['boardName'] }));
        },
        error: () => this.finishCreation(this.t('chat.create.board.error')),
      });
      return;
    }

    if (flow.type === 'list') {
      this.listCartService.createCartList(flow.data['board'].id, { name: flow.data['listName'] }).subscribe({
        next: () => {
          this.projectRefreshService.notify({
            type: 'list-created',
            boardId: flow.data['board'].id,
          });
          this.finishCreation(this.t('chat.create.list.success', {
            list: flow.data['listName'],
            board: flow.data['board'].name,
          }));
        },
        error: () => this.finishCreation(this.t('chat.create.list.error')),
      });
      return;
    }

    this.cartService.createCart(flow.data['list'].id, {
      name: flow.data['cardName'],
      description: flow.data['description'],
      dueDate: flow.data['dueDate'],
      priorityNote: flow.data['priorityNote'],
      statusNote: flow.data['statusNote'],
    }).subscribe({
      next: () => {
        this.projectRefreshService.notify({
          type: 'card-created',
          boardId: flow.data['board'].id,
          listId: flow.data['list'].id,
        });
        this.finishCreation(this.t('chat.create.card.success', {
          card: flow.data['cardName'],
          list: flow.data['list'].name,
          board: flow.data['board'].name,
        }));
      },
      error: () => this.finishCreation(this.t('chat.create.card.error')),
    });
  }

  private finishCreation(message: string) {
    this.pendingCreation = null;
    this.projectContextJson = null;
    this.answer(message);
  }

  private answer(text: string) {
    this.messages.push({ role: 'ai', text });
    this.isLoading = false;
    this.scrollToBottom();
  }

  private detectCreationType(text: string): CreationType | null {
    const value = text.toLowerCase();
    const wantsCreate = /(створ|созда|create|add|додай|добав)/i.test(value);
    if (!wantsCreate) return null;

    if (/(дошк|board)/i.test(value)) return 'board';
    if (/(спис|карт\s*лист|cart\s*list|cartlist|list)/i.test(value)) return 'list';
    if (/(картк|карточ|card)/i.test(value)) return 'card';

    return null;
  }

  private findBoard(context: any, name: string): any | null {
    const normalized = this.normalize(name);
    return context.boards.find((board: any) => this.normalize(board.name) === normalized)
      ?? context.boards.find((board: any) => this.normalize(board.name).includes(normalized))
      ?? null;
  }

  private findList(board: any, name: string): any | null {
    const normalized = this.normalize(name);
    return board.lists.find((list: any) => this.normalize(list.name) === normalized)
      ?? board.lists.find((list: any) => this.normalize(list.name).includes(normalized))
      ?? null;
  }

  private parseDueDate(text: string): string | null | undefined {
    if (this.isSkip(text)) return null;

    const normalized = text.trim().replace(' ', 'T');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  }

  private parsePriority(text: string): number | null {
    const value = this.normalize(text);
    const map: Record<string, number> = {
      '0': 0,
      low: 0,
      'низький': 0,
      'низкий': 0,
      '1': 1,
      medium: 1,
      'середній': 1,
      'средний': 1,
      '2': 2,
      high: 2,
      'високий': 2,
      'высокий': 2,
      '3': 3,
      urgent: 3,
      'терміновий': 3,
      'срочный': 3,
    };

    return map[value] ?? null;
  }

  private parseStatus(text: string): number | null {
    const value = this.normalize(text);
    const map: Record<string, number> = {
      '0': 0,
      draft: 0,
      'чернетка': 0,
      'черновик': 0,
      '1': 1,
      published: 1,
      'опубліковано': 1,
      'опубликовано': 1,
      '2': 2,
      done: 2,
      'виконано': 2,
      'выполнено': 2,
    };

    return map[value] ?? null;
  }

  private isYes(text: string): boolean {
    return /^(так|да|yes|y|ok|ок)$/i.test(text.trim());
  }

  private isCancel(text: string): boolean {
    return /^(скасувати|отмена|cancel|ні|нет|no)$/i.test(text.trim());
  }

  private isSkip(text: string): boolean {
    return /^(skip|пропустити|пропусти|нема|ні|нет|-|порожньо)$/i.test(text.trim());
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private t(key: string, params?: Record<string, string | number | null | undefined>): string {
    let value = this.localization.translate(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replaceAll(`{{${paramKey}}}`, String(paramValue ?? ''));
      });
    }

    return value;
  }

  private getChatErrorMessage(error: any): string {
    if (error?.status === 429) {
      const retryAfter = error.headers?.get?.('Retry-After');
      const retryText = retryAfter ? ` Спробуй ще раз приблизно через ${retryAfter} сек.` : ' Спробуй ще раз трохи пізніше.';

      return `Ліміт запитів до ШІ тимчасово вичерпано.${retryText}`;
    }

    if (error?.status === 0) {
      return 'Не вдалося підключитися до ШІ-сервера. Перевір, чи запущений бекенд.';
    }

    return this.localization.translate('chat.error');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  private buildProjectPrompt(question: string): string {
    return [
      'You are an assistant for a notes/kanban project management app.',
      'Answer only using the PROJECT_CONTEXT_JSON below.',
      'If the user asks where a card is, include the board name and list name.',
      'If statuses or priorities appear as numbers, use these mappings:',
      'priority: 0=Low, 1=Medium, 2=High, 3=Urgent.',
      'status: 0=Draft, 1=Published, 2=Done.',
      'If the answer is not present in the JSON, say that there is no such data in the project context.',
      'Keep the answer concise and in the same language as the user question.',
      'Format the answer as readable Markdown:',
      '- ALWAYS use a hierarchy when answering about boards, lists, and cards.',
      '- Level 1 is board and MUST be exactly: **Board:** Board name',
      '- Level 2 is list and MUST start with two spaces:   **List:** List name',
      '- Level 3 is card and MUST start with four spaces:     **Card:** Card name',
      '- Card details MUST also start with four spaces on separate lines:     **Status:** Status,     **Priority:** Priority,     **Due date:** Due date',
      '- Put every board, list, card, status, priority, and due date on its own separate line.',
      '- Do not output flat comma-separated rows.',
      '- Do not use single asterisks like *Board: or *Card:.',
      '- Do not put Card, Status, Priority, or Due date on the same line.',
      '- Example:',
      '**Board:** Work',
      '  **List:** Todo',
      '    **Card:** Fix auth',
      '    **Status:** Draft',
      '    **Priority:** High',
      '    **Due date:** 2026-06-10',
      '',
      'PROJECT_CONTEXT_JSON:',
      this.projectContextJson,
      '',
      'USER_QUESTION:',
      question,
    ].join('\n');
  }
}
