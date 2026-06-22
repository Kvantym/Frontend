import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

export type AppLanguage = 'uk' | 'ru' | 'en';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class LocalizationService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'interfaceLanguage';
  private readonly fallbackLanguage: AppLanguage = 'uk';

  readonly languages: LanguageOption[] = [
    { code: 'uk', label: 'Українська' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ];

  readonly language = signal<AppLanguage>(this.getInitialLanguage());
  readonly translations = signal<Record<string, string>>({});

  constructor() {
    this.loadLanguage(this.language());
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.storageKey, language);
    }

    this.loadLanguage(language);
  }

  translate(key: string): string {
    return this.translations()[key] ?? key;
  }

  enumLabel(type: 'priority' | 'status', value: unknown): string {
    const normalized = this.normalizeEnumValue(value);
    return this.translate(`${type}.${normalized}`);
  }

  private loadLanguage(language: AppLanguage): void {
    this.http.get<Record<string, string>>(`/i18n/${language}.json`).subscribe({
      next: (translations) => {
        if (this.language() === language) {
          this.translations.set(translations);
        }
      },
      error: () => {
        if (language !== this.fallbackLanguage) {
          this.language.set(this.fallbackLanguage);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.storageKey, this.fallbackLanguage);
          }

          this.loadLanguage(this.fallbackLanguage);
        }
      },
    });
  }

  private getInitialLanguage(): AppLanguage {
    if (!isPlatformBrowser(this.platformId)) return this.fallbackLanguage;

    const saved = localStorage.getItem(this.storageKey);
    return this.isLanguage(saved) ? saved : this.fallbackLanguage;
  }

  private isLanguage(value: string | null): value is AppLanguage {
    return value === 'uk' || value === 'ru' || value === 'en';
  }

  private normalizeEnumValue(value: unknown): number {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;

    const normalized = value.toLowerCase();
    const map: Record<string, number> = {
      low: 0,
      medium: 1,
      high: 2,
      urgent: 3,
      draft: 0,
      published: 1,
      done: 2,
      'низький': 0,
      'середній': 1,
      'високий': 2,
      'терміновий': 3,
      'чернетка': 0,
      'опубліковано': 1,
      'виконано': 2,
      'низкий': 0,
      'средний': 1,
      'высокий': 2,
      'срочный': 3,
      'черновик': 0,
      'опубликовано': 1,
      'выполнено': 2,
    };

    return map[normalized] ?? 0;
  }
}
