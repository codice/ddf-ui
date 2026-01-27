package org.codice.ddf.catalog.multipart.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.InputStream;
import java.util.Arrays;
import java.util.HashSet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.Part;
import org.junit.jupiter.api.Test;

class AutoCloseableMultipartBodyFactoryTest {
  @Test
  void testCreateMultipartBodyCorrectly() throws Exception {
    // Mock HTTP request
    HttpServletRequest mockRequest = mock(HttpServletRequest.class);
    Part part1 = mock(Part.class);
    Part part2 = mock(Part.class);

    // Mock request parts
    when(mockRequest.getParts()).thenReturn(Arrays.asList(part1, part2));
    when(part1.getName()).thenReturn("part1");
    when(part1.getSubmittedFileName()).thenReturn("file1.txt");
    when(part1.getSize()).thenReturn(123L);
    when(part1.getContentType()).thenReturn("text/plain");
    when(part1.getInputStream()).thenReturn(mock(InputStream.class));

    when(part2.getName()).thenReturn("part2");
    when(part2.getSubmittedFileName()).thenReturn("file2.txt");
    when(part2.getSize()).thenReturn(456L);
    when(part2.getContentType()).thenReturn("text/plain");
    when(part2.getInputStream()).thenReturn(mock(InputStream.class));

    AutoCloseableMultipartBody body =
        AutoCloseableMultipartBodyFactory.create(mockRequest, 1024, 512);

    assertNotNull(body);
    assertEquals(2, body.getParts().size());
    assertEquals(new HashSet<>(Arrays.asList(part1, part2)), new HashSet<>(body.getParts()));
  }
}
