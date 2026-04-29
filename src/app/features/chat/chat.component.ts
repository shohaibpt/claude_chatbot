import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('chatInput') private chatInput!: ElementRef<HTMLTextAreaElement>;

  messages: ChatMessage[] = [];
  userInput = '';
  isConnected = true;
  isLoading = false;

  inputExpanded = false;
  avatarSrc = 'assets/images/leo-avatar-new.jpg';
  private readonly avatars = [
    'assets/images/leo-avatar-new.jpg',
    'assets/images/leo-avatar-new3.jpeg',
    'assets/images/leo-avatar-new2.jpeg'
  ];
  private avatarIndex = 0;
  private avatarSub!: Subscription;
  private chatSub?: Subscription;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.avatarSub = interval(2000).subscribe(() => {
      this.avatarIndex = (this.avatarIndex + 1) % this.avatars.length;
      this.avatarSrc = this.avatars[this.avatarIndex];
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.avatarSub?.unsubscribe();
    this.chatSub?.unsubscribe();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', content: text, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;

    this.chatSub = this.chatService.sendMessage(text).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.reply, timestamp: new Date() });
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({ role: 'assistant', content: 'Something went wrong. Please try again.', timestamp: new Date() });
        this.isLoading = false;
      }
    });
  }

  onChatMouseDown(): void {
    setTimeout(() => this.chatInput?.nativeElement.focus(), 0);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }
}
