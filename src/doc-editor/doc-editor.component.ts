import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResumeEnhancementService } from '../app/core/services/resume-enhancement.service';

import { NgxEditorComponent, NgxEditorMenuComponent, Editor } from 'ngx-editor';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../app/core/services/loading.service';

@Component({
  selector: 'app-doc-editor',
  imports: [NgxEditorComponent, NgxEditorMenuComponent, FormsModule],
  templateUrl: './doc-editor.component.html',
  styleUrl: './doc-editor.component.css',

})
export class DocEditorComponent implements OnInit, OnDestroy {
  html = '';
  editor!: Editor;
  blocksFromDB:ResumeBlockDto[]=[];
  constructor(
    private resumeService: ResumeEnhancementService,
    private activatedRouter: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private loader:LoadingService
  ) {}

  downloadDoc(): void {
    // Wrap the HTML in a Word-compatible structure
    const htmlContent = `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resume</title>
        <style>
          body { font-family: 'Poppins', Arial, sans-serif; }
        </style>
      </head>
      <body>${this.html}</body>
      </html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.doc';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 0);
  }



  ngOnInit(): void {
    this.editor = new Editor();
    this.activatedRouter.queryParamMap.subscribe(res=>{

    })
    if(!this.activatedRouter.snapshot.queryParams['resumeId']) return;
    this.resumeService.loadResumeBlocks(this.activatedRouter.snapshot.queryParams['resumeId']).subscribe(blocks => {
      this.blocksFromDB = blocks;
      this.html = this.convertResumeBlocksToHtml(blocks);
      this.saveBlockTexts();
    });
  }

  convertResumeBlocksToHtml(blocks: ResumeBlockDto[]): string {
  return blocks.map(block => {
    const enhancedText = this.resumeService.aiResponseObj?.[`block-${block.blockIndex}`] || '';
    const text = escapeHtml(block.enhancedText || enhancedText || block.originalText || '');

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

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  saveBlockTexts(){
    const modifiedBlocks:ResumeBlockDto[] = this.blocksFromDB.filter(el=> !!this.resumeService.aiResponseObj?.[`block-${el.blockIndex}`]).map(el=> {
      const enhancedText = this.resumeService.aiResponseObj?.[`block-${el.blockIndex}`] ||  '';
      el.enhancedText = enhancedText;
      return el;
    })
    this.resumeService.saveEnhancedBlockTexts(modifiedBlocks).subscribe(res=>{
      this.loader.hideAll()
    });
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

 


// Escaping HTML for safety
function escapeHtml(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}



