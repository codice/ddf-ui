/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
declare const Units: ({ value, onChange, children }: any) => import("react/jsx-runtime").JSX.Element;
declare const Zone: ({ value, onChange }: any) => import("react/jsx-runtime").JSX.Element;
declare const Hemisphere: ({ value, onChange }: any) => import("react/jsx-runtime").JSX.Element;
declare const MinimumSpacing: import("styled-components/dist/types").IStyledComponentBase<"web", import("styled-components").FastOmit<import("react").DetailedHTMLProps<import("react").HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string;
export { Units, Zone, Hemisphere, MinimumSpacing };
