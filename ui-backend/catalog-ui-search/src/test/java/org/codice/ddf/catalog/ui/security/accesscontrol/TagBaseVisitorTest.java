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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;

import java.util.Collections;
import org.geotools.filter.FilterFactoryImpl;
import org.junit.Before;
import org.junit.Test;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.locationtech.jts.io.WKTReader;
import org.opengis.filter.Filter;
import org.opengis.filter.FilterFactory2;

public class TagBaseVisitorTest {

  private static final String TEST = "test";

  private FilterFactory2 ff = new FilterFactoryImpl();
  private final WKTReader wktReader = new WKTReader();
  private Geometry point;

  private TagBaseVisitorUnderTest baseVisitor;

  @Before
  public void setup() throws ParseException {
    baseVisitor = new TagBaseVisitorUnderTest();
    point = wktReader.read("POINT (0 0)");
  }

  /*
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Types that support tags or do not apply (method should NOT be called)
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   */

  @Test
  public void testAndIgnoresMethod() {
    verifyMethodIgnored(
        ff.and(
            ff.equal(ff.property(TEST), ff.literal(10), false),
            ff.equal(ff.property(TEST), ff.literal(10), false)));
  }

  @Test
  public void testNotIgnoresMethod() {
    verifyMethodIgnored(ff.not(ff.equal(ff.property(TEST), ff.literal(10), false)));
  }

  @Test
  public void testOrIgnoresMethod() {
    verifyMethodIgnored(
        ff.or(
            ff.equal(ff.property(TEST), ff.literal(10), false),
            ff.equal(ff.property(TEST), ff.literal(10), false)));
  }

  @Test
  public void testPropertyIsLikeIgnoresMethod() {
    verifyMethodIgnored(ff.like(ff.property(TEST), "pattern*"));
  }

  @Test
  public void testPropertyIsEqualToIgnoresMethod() {
    verifyMethodIgnored(ff.equal(ff.property(TEST), ff.literal(10), false));
  }

  @Test
  public void testPropertyIsNotEqualToIgnoresMethod() {
    verifyMethodIgnored(ff.notEqual(ff.property(TEST), ff.literal(10), false));
  }

  /*
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * Types that CANNOT support tags (method should be called)
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   */

  @Test
  public void testExcludeCallsMethod() {
    verifyMethodCalled(Filter.EXCLUDE);
  }

  @Test
  public void testIncludeCallsMethod() {
    verifyMethodCalled(Filter.INCLUDE);
  }

  @Test
  public void testIdCallsMethod() {
    verifyMethodCalled(ff.id(Collections.emptySet()));
  }

  @Test
  public void testPropertyIsBetweenCallsMethod() {
    verifyMethodCalled(ff.between(ff.property(TEST), ff.literal(5), ff.literal(6)));
  }

  @Test
  public void testPropertyIsGreaterThanCallsMethod() {
    verifyMethodCalled(ff.greater(ff.property(TEST), ff.literal(10)));
  }

  @Test
  public void testPropertyIsGreaterThanOrEqualToCallsMethod() {
    verifyMethodCalled(ff.greaterOrEqual(ff.property(TEST), ff.literal(10)));
  }

  @Test
  public void testPropertyIsLessThanCallsMethod() {
    verifyMethodCalled(ff.less(ff.property(TEST), ff.literal(10)));
  }

  @Test
  public void testPropertyIsLessThanOrEqualToCallsMethod() {
    verifyMethodCalled(ff.lessOrEqual(ff.property(TEST), ff.literal(10)));
  }

  @Test
  public void testPropertyIsNullCallsMethod() {
    verifyMethodCalled(ff.isNull(ff.property(TEST)));
  }

  @Test
  public void testPropertyIsNilCallsMethod() {
    verifyMethodCalled(ff.isNil(ff.property(TEST), new Object()));
  }

  @Test
  public void testBBOXCallsMethod() {
    verifyMethodCalled(ff.bbox(TEST, 0.1, 0.2, 0.3, 0.4, ""));
  }

  @Test
  public void testBeyondCallsMethod() {
    verifyMethodCalled(ff.beyond(ff.property(TEST), ff.literal(point), 10.0, ""));
  }

  @Test
  public void testContainsCallsMethod() {
    verifyMethodCalled(ff.contains(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testCrossesCallsMethod() {
    verifyMethodCalled(ff.crosses(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testDisjointCallsMethod() {
    verifyMethodCalled(ff.disjoint(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testDWithinCallsMethod() {
    verifyMethodCalled(ff.dwithin(ff.property(TEST), ff.literal(point), 10.0, ""));
  }

  @Test
  public void testEqualsCallsMethod() {
    verifyMethodIgnored(ff.equals(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testIntersectsCallsMethod() {
    verifyMethodCalled(ff.intersects(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testOverlapsCallsMethod() {
    verifyMethodCalled(ff.overlaps(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testTouchesCallsMethod() {
    verifyMethodCalled(ff.touches(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testWithinCallsMethod() {
    verifyMethodCalled(ff.within(ff.property(TEST), ff.literal(point)));
  }

  @Test
  public void testNullFilterCallsMethod() {
    baseVisitor.visitNullFilter(new Object());
    assertThat(baseVisitor.isMethodCalled(), is(true));
  }

  @Test
  public void testAnyInteractsCallsMethod() {
    verifyMethodCalled(ff.anyInteracts(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testAfterCallsMethod() {
    verifyMethodCalled(ff.after(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testBeforeCallsMethod() {
    verifyMethodCalled(ff.before(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testBeginsCallsMethod() {
    verifyMethodCalled(ff.begins(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testBegunByCallsMethod() {
    verifyMethodCalled(ff.begunBy(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testDuringCallsMethod() {
    verifyMethodCalled(ff.during(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testEndedByCallsMethod() {
    verifyMethodCalled(ff.endedBy(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testEndsCallsMethod() {
    verifyMethodCalled(ff.ends(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testMeetsCallsMethod() {
    verifyMethodCalled(ff.meets(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testMetByCallsMethod() {
    verifyMethodCalled(ff.metBy(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testOverlappedByCallsMethod() {
    verifyMethodCalled(ff.overlappedBy(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testTContainsCallsMethod() {
    verifyMethodCalled(ff.tcontains(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testTEqualsCallsMethod() {
    verifyMethodCalled(ff.tequals(ff.property(TEST), ff.property(TEST)));
  }

  @Test
  public void testTOverlapsCallsMethod() {
    verifyMethodCalled(ff.toverlaps(ff.property(TEST), ff.property(TEST)));
  }

  private void verifyMethodCalled(Filter filter) {
    filter.accept(baseVisitor, null);
    assertThat(
        "Expected the 'preProcessNonTagPredicate' method to be called, but it wasn't",
        baseVisitor.isMethodCalled(),
        is(true));
  }

  private void verifyMethodIgnored(Filter filter) {
    filter.accept(baseVisitor, null);
    assertThat(
        "Expected the 'preProcessNonTagPredicate' method to NOT be called, but it was",
        baseVisitor.isMethodCalled(),
        is(false));
  }

  private static class TagBaseVisitorUnderTest extends TagBaseVisitor {
    private boolean methodCalled = false;

    private boolean isMethodCalled() {
      return methodCalled;
    }

    @Override
    protected Object preProcessNonTagPredicate(Filter filter, Object data) {
      methodCalled = true;
      return data;
    }
  }
}
