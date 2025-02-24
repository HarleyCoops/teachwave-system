export interface ParsedSection {
  title: string;
  content: string;
}

export interface ParsedContent {
  keyConceptSection: ParsedSection;
  practiceQuestionSection: ParsedSection;
  solutionSection: ParsedSection;
  thoughtsSection: ParsedSection;
}

function extractMathContent(content: string): string {
  // Replace LaTeX math environments with Math component
  return content
    // Display math mode
    .replace(/\\\[(.*?)\\\]/g, (_, math) => `<Math display={true} math="${math.trim()}" />`)
    // Inline math mode
    .replace(/\\\((.*?)\\\)/g, (_, math) => `<Math math="${math.trim()}" />`)
    // Single dollar sign inline math
    .replace(/\$(.*?)\$/g, (_, math) => `<Math math="${math.trim()}" />`);
}

function extractSection(content: string, sectionName: string): ParsedSection {
  const sectionStart = content.indexOf(`\\section*{${sectionName}}`);
  if (sectionStart === -1) {
    return { title: '', content: '' };
  }

  const nextSectionStart = content.indexOf('\\section*{', sectionStart + 1);
  const sectionContent = nextSectionStart === -1 
    ? content.substring(sectionStart)
    : content.substring(sectionStart, nextSectionStart);

  // Remove section command and extract title
  const titleStart = sectionContent.indexOf('{') + 1;
  const titleEnd = sectionContent.indexOf('}');
  const title = sectionContent.substring(titleStart, titleEnd);

  // Get content after the section title
  let mainContent = sectionContent.substring(titleEnd + 1).trim();

  // Process math content
  mainContent = extractMathContent(mainContent);

  // Process subsections
  mainContent = mainContent.replace(/\\subsection\*{(.*?)}/g, '<h3 class="text-xl font-semibold mb-4">$1</h3>');

  // Process lists
  mainContent = mainContent
    .replace(/\\begin{enumerate}/g, '<ol class="list-decimal list-outside ml-6 space-y-4">')
    .replace(/\\end{enumerate}/g, '</ol>')
    .replace(/\\begin{itemize}/g, '<ul class="list-disc list-inside mt-2 space-y-2 ml-4">')
    .replace(/\\end{itemize}/g, '</ul>')
    .replace(/\\item\s/g, '<li>');

  // Process infobox (Christian's Thoughts)
  mainContent = mainContent
    .replace(/\\begin{infobox}\[(.*?)\]/g, '<div class="bg-primary/5 border border-primary/20 rounded-lg p-6"><h3 class="text-xl font-semibold mb-4">$1</h3>')
    .replace(/\\end{infobox}/g, '</div>');

  return {
    title,
    content: mainContent
  };
}

export function parseTexContent(content: string): ParsedContent {
  return {
    keyConceptSection: extractSection(content, 'Key Concept'),
    practiceQuestionSection: extractSection(content, 'Practice Question'),
    solutionSection: extractSection(content, 'Solution and Explanation'),
    thoughtsSection: extractSection(content, "Christian's Thoughts")
  };
}
