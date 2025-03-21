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

// Correspond to classes in log-entry.less
// Also used to populate level-selector drop down list
// these should be ordered by severity from lowest to highest
const levels = {
  ALL: undefined,
  TRACE: 'bg-[#e6e6ff] text-black',
  DEBUG: 'bg-[#e6ffe6] text-black',
  INFO: '',
  WARN: 'bg-[#ffffe6] text-black',
  ERROR: 'bg-[#ffe6e6] text-black',
}

type LevelKeyType = keyof typeof levels

export function getColorForLevel(level: LevelKeyType) {
  return levels[level]
}

export function getLevels() {
  return Object.keys(levels)
}
