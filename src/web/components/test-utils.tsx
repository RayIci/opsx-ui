import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Render inside a router. `Markdown` reads the current route (to suppress
 * self-references) and the live snapshot (to resolve artifact links), so it only
 * makes sense inside the routed app it lives in.
 */
export function renderRouted(ui: ReactElement, path = "/") {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}
