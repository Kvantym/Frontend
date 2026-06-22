import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartListArchive } from './cart-list-archive';

describe('CartListArchive', () => {
  let component: CartListArchive;
  let fixture: ComponentFixture<CartListArchive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartListArchive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartListArchive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
