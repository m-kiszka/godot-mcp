import { describe, it, expect } from 'vitest';
import { addAutoloadEntry, removeAutoloadEntry } from '../src/utils.js';

const NAME = 'McpInteractionServer';
const PATH = 'res://mcp_interaction_server.gd';

describe('addAutoloadEntry / removeAutoloadEntry', () => {
  it('add then remove leaves the file byte-identical (LF)', () => {
    const original = '[application]\n\nconfig/name="x"\n\n[autoload]\n\nA="*res://a.gd"\nB="*res://b.gd"\n\n[input]\n';
    const injected = addAutoloadEntry(original, NAME, PATH);
    expect(injected).toContain(`[autoload]\n\n${NAME}="*${PATH}"\nA="*res://a.gd"`);
    expect(removeAutoloadEntry(injected, NAME)).toBe(original);
  });

  it('repeated runs never accumulate blank lines', () => {
    const original = '[autoload]\n\nA="*res://a.gd"\n';
    let content = original;
    for (let i = 0; i < 5; i++) content = removeAutoloadEntry(addAutoloadEntry(content, NAME, PATH), NAME);
    expect(content).toBe(original);
  });

  it('keeps CRLF line endings', () => {
    const original = '[autoload]\r\n\r\nA="*res://a.gd"\r\n';
    const injected = addAutoloadEntry(original, NAME, PATH);
    expect(injected).toBe(`[autoload]\r\n\r\n${NAME}="*${PATH}"\r\nA="*res://a.gd"\r\n`);
    expect(removeAutoloadEntry(injected, NAME)).toBe(original);
  });

  it('creates the section when missing', () => {
    expect(addAutoloadEntry('[application]\n', NAME, PATH)).toBe(`[application]\n\n[autoload]\n\n${NAME}="*${PATH}"\n`);
  });

  it('removes only the named entry, not one that merely starts with the name', () => {
    const content = `[autoload]\n\n${NAME}Extra="*res://x.gd"\n${NAME}="*${PATH}"\n`;
    expect(removeAutoloadEntry(content, NAME)).toBe(`[autoload]\n\n${NAME}Extra="*res://x.gd"\n`);
  });
});
