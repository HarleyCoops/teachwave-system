import os
import re
import json
from typing import Dict, List, Optional

def process_math(content: str) -> str:
    """Prepare LaTeX math for client-side rendering (minimal processing)."""
    # 1. Fix standalone words to use \text{}
    def wrap_words_in_text(match: re.Match) -> str:
        word = match.group(1)
        # Expanded list of known LaTeX commands
        known_commands = [
            # Math operators
            'sum', 'prod', 'dfrac', 'quad', 'left', 'right', 'times',
            'sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'int', 'oint',
            'iint', 'iiint', 'iiiint', 'fint', 'displaystyle',
            # Greek letters
            'alpha', 'beta', 'gamma', 'delta', 'theta', 'lambda',
            'mu', 'sigma', 'phi', 'chi', 'omega',
            # Symbols and relations
            'pm', 'times', 'div', 'leq', 'geq', 'neq', 'approx', 'infty',
            'cdot', 'ldots', 'vdots', 'ddots', 'in', 'notin', 'subset',
            'subseteq', 'supset', 'supseteq', 'cap', 'cup', 'setminus',
            # Calculus and advanced math
            'partial', 'nabla', 'exists', 'forall', 'therefore', 'because',
            'iff', 'land', 'lor', 'lnot', 'implies', 'Leftrightarrow',
            'equiv', 'sim', 'cong',
            # Text formatting and environments
            'text', 'textbf', 'textit', 'begin', 'end', 'align*', 'equation*',
            # Other
            'frac', 'operatorname', 'or'
        ]
        if word.startswith('text{') or word in known_commands:
            return f"\\{word}"  # Return the command as is
        if word[0].isupper() or any(c in word for c in '0123456789_^{}'):
            return f"\\text{{{word}}}"  # Wrap in text
        return f"\\{word}"

    # Find words after backslash and process them
    content = re.sub(
        r'\\([A-Za-z][a-zA-Z]*)',  # Match ONLY the word itself
        wrap_words_in_text,
        content
    )

    # 2. Ensure consistent math delimiters: $...$ -> \(...\)
    content = re.sub(r'\$([^$]+)\$', r'\\(\1\\)', content)
    
    return content

def process_list_items(content: str) -> List[str]:
    """Process individual list items"""
    items = []
    for item in content.split('\\item')[1:]:  # Skip empty first split
        item = item.strip()

        # Replace \$ with $ before any other processing
        item = item.replace('\\$', '$')

        # Handle numbers with commas that shouldn't be math
        item = re.sub(r'\$?([\d,]+)\$?', r'\1', item)

        # Process formatting first
        item = process_formatting(item)

        # Process math last
        item = process_math(item)
        
        items.append(item)
    return items

def process_list(content: str, list_type: str) -> str:
    """Convert LaTeX lists to HTML"""
    items = process_list_items(content)
    class_name = 'list-decimal' if list_type == 'ol' else 'list-disc'
    items_html = ''.join([f'<li class="mb-2">{item}</li>' for item in items])
    return f'<{list_type} class="{class_name} ml-6 space-y-2">{items_html}</{list_type}>'

def process_environments(content: str) -> str:
    """Handle list and infobox environments."""
    content = re.sub(
        r'\\begin{itemize}(.*?)\\end{itemize}',
        lambda m: process_list(m.group(1), 'ul'),
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'\\begin{enumerate}(.*?)\\end{enumerate}',
        lambda m: process_list(m.group(1), 'ol'),
        content,
        flags=re.DOTALL
    )
    content = re.sub(
        r'\\begin{infobox}\[(.*?)\](.*?)\\end{infobox}',
        lambda m: (
            f'<div class="bg-primary/5 border border-primary/20 rounded-lg p-6">'
            f'<h3 class="text-xl font-semibold mb-4">{m.group(1)}</h3>'
            f'<div class="prose prose-neutral">{process_section(m.group(2))}</div>'
            f'</div>'
        ),
        content,
        flags=re.DOTALL
    )
    return content

def process_formatting(content: str) -> str:
    """Handle text formatting (bold, italic, sections, verbatim)."""
    replacements = [
        (r'\\section\*{(.*?)}', r'<h2 class="text-2xl font-bold mb-4">\1</h2>'),
        (r'\\subsection\*{(.*?)}', r'<h3 class="text-xl font-semibold mb-3">\1</h3>'),
        (r'\\textbf{(.*?)}', r'<strong>\1</strong>'),
        (r'\\textit{(.*?)}', r'<em>\1</em>'),
        (r'\\verb\|(.*?)\|', r'<code class="bg-gray-100 px-1 rounded">\1</code>'),
        (r'\\%', '%'),
        (r'\\&', '&'),
        (r'\\_', '_'),
    ]
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    return content

def extract_sections(content: str) -> Dict[str, str]:
    """Extract sections."""
    sections = {}
    key_concept_match = re.search(
        r'\\section\*{Key Concept:.*?}(.*?)(?=\\section\*)',
        content,
        re.DOTALL
    )
    if key_concept_match:
        sections['keyConceptSection'] = process_section(key_concept_match.group(1))

    practice_match = re.search(
        r'\\section\*{Practice Question}(.*?)(?=\\section\*)',
        content,
        re.DOTALL
    )
    if practice_match:
        sections['practiceQuestion'] = process_section(practice_match.group(1))

    solution_match = re.search(
        r'\\section\*{Solution.*?}(.*)',
        content,
        re.DOTALL
    )
    if solution_match:
        sections['solution'] = process_section(solution_match.group(1))

    return sections

def process_section(content: str) -> str:
    """Main section processing: order is crucial."""
    # Handle escaped characters first
    content = content.replace('\\$', '$')  # Currency
    content = re.sub(r'\$?([\d,]+)\$?', r'\1', content)  # Commas in numbers

    # Process in order: Environments -> Formatting -> Math
    content = process_environments(content)  # Lists, infobox
    content = process_formatting(content)    # Bold, italic, sections
    content = process_math(content)         # Fix delimiters, \text{}
    
    # Clean up newlines
    content = re.sub(r'\n\s*\n', r'\n\n', content)
    return f'<div class="prose prose-neutral max-w-none space-y-4">{content}</div>'

def main():
    """Process all files."""
    os.makedirs('src/content', exist_ok=True)
    for i in range(1, 11):
        input_file = f'Content/question_{i}.tex'
        output_file = f'src/content/question_{i}.json'
        print(f"Processing {input_file}...")
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
            sections = extract_sections(content)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(sections, f, indent=2, ensure_ascii=False)
            print(f"Successfully created {output_file}")
        except Exception as e:
            print(f"Error processing {input_file}: {str(e)}")

if __name__ == '__main__':
    main()
