# markdown-rendering Specification

## Purpose
How the viewer renders any OpenSpec markdown document on any surface — one consistent pipeline covering headings and prose, inline code, tables, and code fences (syntax-highlighted when language-tagged, plain when not), with copy-to-clipboard on code blocks, rendering that follows the active theme, and a refusal to render raw HTML. Consumers such as `spec-browser`, `spec-diff`, `archive-browser`, `change-tasks`, and `change-artifact-nav` own *which* document is shown; this capability owns *how* it renders.

## Requirements

### Requirement: Consistent rendering on every surface

The system SHALL render OpenSpec markdown through one shared renderer, so that the same document content is presented identically regardless of which surface displays it — a change's proposal, design, or tasks; a specification document; or an archived change's artifacts and deltas.

#### Scenario: The same content on two surfaces

- **WHEN** the same markdown content is displayed on two different surfaces
- **THEN** it is rendered with the same structure and styling on both

#### Scenario: A new surface renders markdown

- **WHEN** a surface displays an OpenSpec markdown document
- **THEN** it uses the shared renderer rather than its own markdown treatment

### Requirement: Syntax highlighting for language-tagged code

The system SHALL syntax-highlight fenced code blocks that declare a language, so code in designs and proposals is readable as code.

#### Scenario: A fence declares a language

- **WHEN** a document contains a fenced code block tagged with a supported language
- **THEN** its content is displayed with syntax highlighting for that language

#### Scenario: A fence declares an unsupported language

- **WHEN** a document contains a fenced code block tagged with a language the renderer does not support
- **THEN** the block is displayed as plain preformatted text without error

### Requirement: Untagged code fences are not auto-detected

The system SHALL render fenced code blocks that declare no language as plain preformatted text, and SHALL NOT infer a language for them, because such fences frequently contain ASCII diagrams and tables rather than source code, which language inference would misrender.

#### Scenario: A fence has no language tag

- **WHEN** a document contains a fenced block with no language tag
- **THEN** its content is displayed as plain preformatted text with its spacing preserved
- **AND** no syntax highlighting is applied to it

#### Scenario: An untagged fence contains a diagram

- **WHEN** an untagged fence contains an ASCII diagram
- **THEN** the diagram is displayed exactly as authored, with its alignment intact

### Requirement: Code blocks can be copied

The system SHALL offer a way to copy a fenced code block's contents to the clipboard, so snippets can be used without manual selection.

#### Scenario: Copying a code block

- **WHEN** a user activates the copy control on a fenced code block
- **THEN** that block's exact text content is placed on the clipboard
- **AND** the user is given confirmation that it was copied

#### Scenario: Copying does not modify the document

- **WHEN** a user copies a code block
- **THEN** the underlying document is not modified, consistent with the viewer's read-only guarantee

### Requirement: Inline code is visually distinct

The system SHALL render inline code spans distinctly from surrounding prose, because inline code is the most frequent element in OpenSpec documents and carries most of their technical meaning.

#### Scenario: Inline code within a sentence

- **WHEN** a paragraph contains an inline code span
- **THEN** it is displayed distinctly from the surrounding prose
- **AND** it remains legible inside headings, list items, and table cells

### Requirement: Tables are rendered

The system SHALL render GitHub-flavored markdown tables as tables, with their header row distinguished from body rows.

#### Scenario: A document contains a table

- **WHEN** a document contains a GFM table
- **THEN** it is displayed as a table with its header row distinguished

#### Scenario: A wide table

- **WHEN** a table is wider than its container
- **THEN** the table can be viewed in full without the surrounding page scrolling horizontally

### Requirement: Rendering follows the active theme

The system SHALL render markdown — including syntax-highlighted code — using the active light or dark theme, so no surface is unreadable or visually inconsistent in either theme.

#### Scenario: Switching theme with code on screen

- **WHEN** a user switches between light and dark themes while a document with highlighted code is displayed
- **THEN** the document and its code colors update to the active theme and remain legible

### Requirement: Raw HTML is not rendered

The system SHALL NOT render raw HTML embedded in markdown content, treating document content as markdown only, so that project content can never inject markup into the viewer.

#### Scenario: A document contains raw HTML

- **WHEN** a markdown document contains raw HTML
- **THEN** the HTML is not rendered as markup
