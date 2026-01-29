import type { CaseStudy } from "@/data/caseStudies";

export async function CaseStudyPdf(caseStudy: CaseStudy): Promise<void> {
  // Dynamic import to avoid build issues
  const { default: jsPDF } = await import("jspdf");
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    doc.text(text, x, y, options);
    return y;
  };

  const drawLine = (y: number) => {
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 193, 7);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  addText("TribuTalks", margin, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  addText("ESTUDO DE CASO", margin, 30);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText(caseStudy.company, margin, 38);

  yPos = 55;

  // Company info
  doc.setTextColor(100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  addText(`Setor: ${caseStudy.sector} | Implementação: ${caseStudy.timeline}`, margin, yPos);
  
  yPos += 15;

  // Results Section
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("RESULTADOS ALCANÇADOS", margin, yPos);
  
  yPos += 8;
  drawLine(yPos);
  yPos += 10;

  const resultsPerRow = 3;
  const resultWidth = contentWidth / resultsPerRow;
  
  caseStudy.results.forEach((result, index) => {
    const xOffset = margin + (index % resultsPerRow) * resultWidth;
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(xOffset, yPos, resultWidth - 5, 30, 3, 3, "F");
    
    doc.setTextColor(255, 193, 7);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    addText(result.value, xOffset + 5, yPos + 12);
    
    doc.setTextColor(60);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    addText(result.metric, xOffset + 5, yPos + 20);
    
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(result.description, resultWidth - 12);
    doc.text(lines, xOffset + 5, yPos + 26);
  });

  yPos += 45;

  // Challenge Section
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("O DESAFIO", margin, yPos);
  
  yPos += 8;
  drawLine(yPos);
  yPos += 8;

  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const challengeLines = doc.splitTextToSize(caseStudy.challenge, contentWidth);
  doc.text(challengeLines, margin, yPos);
  yPos += challengeLines.length * 5 + 10;

  // Solution Section
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("A SOLUÇÃO", margin, yPos);
  
  yPos += 8;
  drawLine(yPos);
  yPos += 8;

  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const solutionLines = doc.splitTextToSize(caseStudy.solution, contentWidth);
  doc.text(solutionLines, margin, yPos);
  yPos += solutionLines.length * 5 + 10;

  // Tools Used
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  addText("Ferramentas utilizadas:", margin, yPos);
  
  yPos += 6;
  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  addText(caseStudy.toolsUsed.join(" • "), margin, yPos);
  
  yPos += 15;

  // Testimonial Box
  doc.setFillColor(255, 248, 225);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F");
  
  doc.setTextColor(180, 140, 0);
  doc.setFontSize(18);
  addText('"', margin + 5, yPos + 10);
  
  doc.setTextColor(60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const quoteLines = doc.splitTextToSize(caseStudy.testimonial.quote, contentWidth - 20);
  doc.text(quoteLines, margin + 12, yPos + 12);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  addText(`— ${caseStudy.testimonial.author}, ${caseStudy.testimonial.role}`, margin + 12, yPos + 28);

  // Footer
  doc.setFillColor(10, 10, 10);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  addText("TribuTalks - GPS da Reforma Tributária", margin, pageHeight - 10);
  addText("tributechai.lovable.app", pageWidth - margin - 40, pageHeight - 10);

  // Save
  doc.save(`estudo-de-caso-${caseStudy.slug}.pdf`);
}
