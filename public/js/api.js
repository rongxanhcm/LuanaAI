/* ========================================
   API FUNCTIONS
   ======================================== */

// ─── CALL AI API ─────────────────────────────────────────
async function callAI(prompt) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content.map(c => c.text || '').join('').trim();
}

// ─── GENERATE CHAPTER CONTENT ────────────────────────────
async function generateChapter(chapterInfo, context) {
  const { topic, docTypeLabel, major, description } = context;

  const prompt = `Write content for this chapter of a Vietnamese academic document.

TOPIC: ${topic}
DOCUMENT TYPE: ${docTypeLabel}
${major ? `FIELD: ${major}` : ''}
${description ? `CONTEXT: ${description}` : ''}

CHAPTER: ${chapterInfo.title}

SECTIONS TO WRITE (${chapterInfo.sections.length} sections):
${chapterInfo.sections.map((s, idx) => `${idx + 1}. ${s.heading}`).join('\n')}

PROJECT CONTEXT:
${context.readme ? `README/Project Info: ${context.readme.substring(0, 1500)}...` : '(No README provided)'}

REQUIREMENTS:
- Write 150-250 words for EACH section
- Write in Vietnamese, academic style
- Be specific and detailed
- Generate ALL ${chapterInfo.sections.length} sections

OUTPUT FORMAT:
---SECTION---
HEADING: [exact heading from list]
LEVEL: ${chapterInfo.sections[0].level === 1 ? '1' : '1 or 2'}
CONTENT: [150-250 words of Vietnamese content, no line breaks]
---SECTION---
HEADING: [next heading]
LEVEL: [1 or 2]
CONTENT: [content]

Generate all ${chapterInfo.sections.length} sections now.`;

  const rawText = await callAI(prompt);

  const sections = [];
  const sectionBlocks = rawText.split('---SECTION---').filter(s => s.trim());

  for (const block of sectionBlocks) {
    const headingMatch = block.match(/HEADING:\s*(.+?)(?:\n|LEVEL:)/);
    const levelMatch = block.match(/LEVEL:\s*(\d+)/);
    const contentMatch = block.match(/CONTENT:\s*([\s\S]+?)(?=\nHEADING:|\nLEVEL:|---SECTION---|$)/);

    if (headingMatch && levelMatch) {
      sections.push({
        heading: headingMatch[1].trim(),
        level: parseInt(levelMatch[1]),
        content: contentMatch ? contentMatch[1].trim() : ''
      });
    }
  }

  console.log(`✓ Chapter "${chapterInfo.title}": Generated ${sections.length}/${chapterInfo.sections.length} sections`);
  return sections;
}
