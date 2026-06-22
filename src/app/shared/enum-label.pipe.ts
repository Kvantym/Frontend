import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '../services/localization.service';

@Pipe({
  name: 'enumLabel',
  standalone: true,
  pure: false,
})
export class EnumLabelPipe implements PipeTransform {
  constructor(private localization: LocalizationService) {}

  transform(value: unknown, type: 'priority' | 'status'): string {
    return this.localization.enumLabel(type, value);
  }
}
