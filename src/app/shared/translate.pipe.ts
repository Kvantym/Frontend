import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private localization: LocalizationService) {}

  transform(key: string, params?: Record<string, string | number | null | undefined>): string {
    let value = this.localization.translate(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = value.replaceAll(`{{${paramKey}}}`, String(paramValue ?? ''));
      });
    }

    return value;
  }
}
