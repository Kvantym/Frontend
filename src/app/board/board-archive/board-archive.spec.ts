import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardArchive } from './board-archive';

describe('BoardArchive', () => {
  let component: BoardArchive;
  let fixture: ComponentFixture<BoardArchive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardArchive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardArchive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
