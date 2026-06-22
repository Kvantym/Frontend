import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'chatMessageFormat',
  standalone: true,
})
export class ChatMessageFormatPipe implements PipeTransform {
  private readonly treeLabels = 'Board|List|Card|Status|Priority|Due date|Дата виконання|Дата';
  private readonly labelPattern = new RegExp(`^(${this.treeLabels}):\\s*`, 'i');

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    const escaped = this.escapeHtml(value ?? '')
      .replace(/\r\n/g, '\n')
      .replace(/(?:\\n|\/n)/g, '\n');

    const formatted = this.expandInlineTreeParts(escaped.split('\n'))
      .map((line) => this.formatLine(line))
      .join('');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private formatLine(line: string): string {
    const cleaned = this.cleanLine(line);

    if (!cleaned) return '<div class="chat-line-spacer"></div>';

    if (!this.isTreeLine(cleaned)) {
      return `<div class="chat-plain-line">${this.formatInlineMarkdown(cleaned)}</div>`;
    }

    const level = this.getTreeLevel(line, cleaned);
    const content = this.formatLabel(cleaned);

    return `<div class="chat-tree-line level-${level}">${content}</div>`;
  }

  private expandInlineTreeParts(lines: string[]): string[] {
    const expanded: string[] = [];
    const separatorPattern = new RegExp(`\\s+[/—-]\\s+(?=(${this.treeLabels}):)`, 'gi');
    const inlineLabelPattern = new RegExp(`\\s+(?=(${this.treeLabels}):)`, 'gi');

    lines.forEach((line) => {
      const normalized = line
        .replace(separatorPattern, '\n')
        .replace(inlineLabelPattern, '\n');

      normalized.split('\n').forEach((part) => expanded.push(this.applyImplicitIndent(part, line)));
    });

    return expanded;
  }

  private applyImplicitIndent(part: string, originalLine: string): string {
    const cleaned = this.cleanLine(part);
    const originalSpaces = originalLine.match(/^\s*/)?.[0] ?? '';

    if (/^(Status|Priority|Due date|Дата виконання|Дата):/i.test(cleaned)) {
      return '      ' + cleaned;
    }

    if (/^Card:/i.test(cleaned)) {
      return originalSpaces.length >= 4 ? part : '    ' + cleaned;
    }

    if (/^List:/i.test(cleaned)) {
      return originalSpaces.length >= 2 ? part : '  ' + cleaned;
    }

    return part;
  }

  private cleanLine(line: string): string {
    return line
      .trim()
      .replace(/^[-•]\s*/, '')
      .replace(/\*/g, '')
      .trim();
  }

  private getTreeLevel(originalLine: string, cleaned: string): number {
    const leadingSpaces = originalLine.match(/^\s*/)?.[0].length ?? 0;

    if (leadingSpaces >= 6) return 4;
    if (leadingSpaces >= 4) return 3;
    if (leadingSpaces >= 2) return 2;
    if (/^Board:/i.test(cleaned)) return 1;
    if (/^List:/i.test(cleaned)) return 2;
    if (/^Card:/i.test(cleaned)) return 3;
    if (/^(Status|Priority|Due date|Дата виконання|Дата):/i.test(cleaned)) return 4;

    return 1;
  }

  private isTreeLine(line: string): boolean {
    return this.labelPattern.test(line);
  }

  private formatLabel(line: string): string {
    return line.replace(this.labelPattern, (_match, label: string) => `<strong>${label}:</strong> `);
  }

  private formatInlineMarkdown(line: string): string {
    return line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
