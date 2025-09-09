package org.codice.ddf.catalog.multipart.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import javax.servlet.http.Part;
import org.junit.jupiter.api.Test;

class AutoCloseableMultipartBodyTest {

  @Test
  void testCloseDeletesPartsSuccessfully() throws Exception {
    Part part1 = mock(Part.class);
    Part part2 = mock(Part.class);
    Collection<Part> parts = Arrays.asList(part1, part2);

    AutoCloseableMultipartBody body =
        new AutoCloseableMultipartBody(Collections.emptyList(), parts, null, true);

    body.close();

    verify(part1).delete();
    verify(part2).delete();
  }

  @Test
  void testGetPartsReturnsCorrectCollection() {
    Part part1 = mock(Part.class);
    Part part2 = mock(Part.class);
    Collection<Part> parts = Arrays.asList(part1, part2);

    AutoCloseableMultipartBody body =
        new AutoCloseableMultipartBody(Collections.emptyList(), parts, null, true);

    assertEquals(parts, body.getParts());
  }
}
