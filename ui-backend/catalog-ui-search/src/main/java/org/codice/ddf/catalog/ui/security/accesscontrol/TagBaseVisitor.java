/**
 * Copyright (c) Codice Foundation
 *
 * <p>This is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or any later version.
 *
 * <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public
 * License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.security.accesscontrol;

import org.geotools.api.filter.ExcludeFilter;
import org.geotools.api.filter.Filter;
import org.geotools.api.filter.Id;
import org.geotools.api.filter.IncludeFilter;
import org.geotools.api.filter.PropertyIsBetween;
import org.geotools.api.filter.PropertyIsGreaterThan;
import org.geotools.api.filter.PropertyIsGreaterThanOrEqualTo;
import org.geotools.api.filter.PropertyIsLessThan;
import org.geotools.api.filter.PropertyIsLessThanOrEqualTo;
import org.geotools.api.filter.PropertyIsNil;
import org.geotools.api.filter.PropertyIsNull;
import org.geotools.api.filter.spatial.BBOX;
import org.geotools.api.filter.spatial.Beyond;
import org.geotools.api.filter.spatial.Contains;
import org.geotools.api.filter.spatial.Crosses;
import org.geotools.api.filter.spatial.DWithin;
import org.geotools.api.filter.spatial.Disjoint;
import org.geotools.api.filter.spatial.Equals;
import org.geotools.api.filter.spatial.Intersects;
import org.geotools.api.filter.spatial.Overlaps;
import org.geotools.api.filter.spatial.Touches;
import org.geotools.api.filter.spatial.Within;
import org.geotools.api.filter.temporal.After;
import org.geotools.api.filter.temporal.AnyInteracts;
import org.geotools.api.filter.temporal.Before;
import org.geotools.api.filter.temporal.Begins;
import org.geotools.api.filter.temporal.BegunBy;
import org.geotools.api.filter.temporal.During;
import org.geotools.api.filter.temporal.EndedBy;
import org.geotools.api.filter.temporal.Ends;
import org.geotools.api.filter.temporal.Meets;
import org.geotools.api.filter.temporal.MetBy;
import org.geotools.api.filter.temporal.OverlappedBy;
import org.geotools.api.filter.temporal.TContains;
import org.geotools.api.filter.temporal.TEquals;
import org.geotools.api.filter.temporal.TOverlaps;
import org.geotools.filter.visitor.DefaultFilterVisitor;

/**
 * Provides both default traversal behavior and a {@link #preProcessNonTagPredicate(Filter, Object)}
 * function for defining default visit behavior when <b>any</b> filter that does not support tagging
 * is encountered during processing.
 */
public abstract class TagBaseVisitor extends DefaultFilterVisitor {

  /**
   * For any filter type that could not possibly reference {@link
   * ddf.catalog.data.types.Core#METACARD_TAGS}, this method is invoked prior to the actual visit
   * method.
   *
   * <p>The following types <b>do not</b> call this function prior to a visit:
   *
   * <ul>
   *   <li>{@link org.geotools.api.filter.And}
   *   <li>{@link org.geotools.api.filter.Or}
   *   <li>{@link org.geotools.api.filter.Not}
   *   <li>{@link org.geotools.api.filter.PropertyIsEqualTo}
   *   <li>{@link org.geotools.api.filter.PropertyIsNotEqualTo}
   *   <li>{@link org.geotools.api.filter.PropertyIsLike}
   *   <li>Any {@link org.geotools.api.filter.expression.Expression}
   * </ul>
   *
   * @param filter the filter about to be visited.
   * @param data the data being passed.
   * @return the data being returned.
   */
  protected abstract Object preProcessNonTagPredicate(Filter filter, Object data);

  @Override
  public Object visit(ExcludeFilter filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(IncludeFilter filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Id filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsBetween filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsGreaterThan filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsGreaterThanOrEqualTo filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsLessThan filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsLessThanOrEqualTo filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsNull filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(PropertyIsNil filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(BBOX filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Beyond filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Contains filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Crosses filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Disjoint filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(DWithin filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Equals filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Intersects filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Overlaps filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Touches filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visit(Within filter, Object data) {
    data = preProcessNonTagPredicate(filter, data);
    return super.visit(filter, data);
  }

  @Override
  public Object visitNullFilter(Object data) {
    data = preProcessNonTagPredicate(null, data);
    return super.visitNullFilter(data);
  }

  @Override
  public Object visit(After after, Object data) {
    data = preProcessNonTagPredicate(after, data);
    return super.visit(after, data);
  }

  @Override
  public Object visit(AnyInteracts anyInteracts, Object data) {
    data = preProcessNonTagPredicate(anyInteracts, data);
    return super.visit(anyInteracts, data);
  }

  @Override
  public Object visit(Before before, Object data) {
    data = preProcessNonTagPredicate(before, data);
    return super.visit(before, data);
  }

  @Override
  public Object visit(Begins begins, Object data) {
    data = preProcessNonTagPredicate(begins, data);
    return super.visit(begins, data);
  }

  @Override
  public Object visit(BegunBy begunBy, Object data) {
    data = preProcessNonTagPredicate(begunBy, data);
    return super.visit(begunBy, data);
  }

  @Override
  public Object visit(During during, Object data) {
    data = preProcessNonTagPredicate(during, data);
    return super.visit(during, data);
  }

  @Override
  public Object visit(EndedBy endedBy, Object data) {
    data = preProcessNonTagPredicate(endedBy, data);
    return super.visit(endedBy, data);
  }

  @Override
  public Object visit(Ends ends, Object data) {
    data = preProcessNonTagPredicate(ends, data);
    return super.visit(ends, data);
  }

  @Override
  public Object visit(Meets meets, Object data) {
    data = preProcessNonTagPredicate(meets, data);
    return super.visit(meets, data);
  }

  @Override
  public Object visit(MetBy metBy, Object data) {
    data = preProcessNonTagPredicate(metBy, data);
    return super.visit(metBy, data);
  }

  @Override
  public Object visit(OverlappedBy overlappedBy, Object data) {
    data = preProcessNonTagPredicate(overlappedBy, data);
    return super.visit(overlappedBy, data);
  }

  @Override
  public Object visit(TContains contains, Object data) {
    data = preProcessNonTagPredicate(contains, data);
    return super.visit(contains, data);
  }

  @Override
  public Object visit(TEquals equals, Object data) {
    data = preProcessNonTagPredicate(equals, data);
    return super.visit(equals, data);
  }

  @Override
  public Object visit(TOverlaps contains, Object data) {
    data = preProcessNonTagPredicate(contains, data);
    return super.visit(contains, data);
  }
}
