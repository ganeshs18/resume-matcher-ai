import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResumeEnhancementService } from '../app/core/services/resume-enhancement.service';

import { NgxEditorComponent, NgxEditorMenuComponent, Editor } from 'ngx-editor';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doc-editor',
  imports: [NgxEditorComponent, NgxEditorMenuComponent, FormsModule],
  templateUrl: './doc-editor.component.html',
  styleUrl: './doc-editor.component.css',

})
export class DocEditorComponent implements OnInit, OnDestroy {

  constructor(private resumeService: ResumeEnhancementService) {

  }

  html = '';
  editor!: Editor;
  ngOnInit(): void {
    this.editor = new Editor();

    this.resumeService.loadResumeBlocks(52) .subscribe(blocks => {
        this.html = convertResumeBlocksToHtml(blocks);
      });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

}



export interface ResumeBlockDto {
  id: number;
  blockIndex: number;
  originalText: string;
  enhancedText: string | null;
  font: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: string;
  spacing: number;
  blockType: string;
  styleClass: string | null;
}

export function convertResumeBlocksToHtml(blocks: ResumeBlockDto[]): string {
  return blocks.map(block => {
    const text = escapeHtml(block.enhancedText || block.originalText || '');

    const align = block.alignment || 'left';
    const spacing = block.spacing > 0 ? `line-height: ${block.spacing};` : '';
    const style = `text-align: ${align}; font-family: ${block.font}; font-size: ${block.fontSize}px; ${spacing}`.trim();

    let styledText = text;
    if (block.bold) styledText = `<strong>${styledText}</strong>`;
    if (block.italic) styledText = `<em>${styledText}</em>`;
    if (block.underline) styledText = `<u>${styledText}</u>`;

    switch (block.blockType) {
      case 'header':
        return `<h3 style="${style}">${styledText}</h3>`;

      case 'bullet':
        return `<ul style="${style}"><li>${styledText}</li></ul>`;

      case 'numbered':
        return `<ol style="${style}"><li>${styledText}</li></ol>`;

      case 'table':
        // Each "row" is separated by new line and cells by `|`
        const rows = text.split('\n').map(row =>
          `<tr>` + row.split('|').filter(cell => cell.trim()).map(cell => `<td>${escapeHtml(cell.trim())}</td>`).join('') + `</tr>`
        ).join('');
        return `<table style="${style}" border="1" cellpadding="4">${rows}</table>`;

      case 'hr':
        return `<hr style="${style}" />`;

      case 'paragraph':
      default:
        return `<p style="${style}">${styledText}</p>`;
    }
  }).join('\n');
}


// Escaping HTML for safety
function escapeHtml(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



