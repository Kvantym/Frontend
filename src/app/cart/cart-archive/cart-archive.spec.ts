import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartArchive } from './cart-archive';

describe('CartArchive', () => {
  let component: CartArchive;
  let fixture: ComponentFixture<CartArchive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartArchive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartArchive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
