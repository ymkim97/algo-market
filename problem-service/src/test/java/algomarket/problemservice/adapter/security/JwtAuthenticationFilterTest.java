package algomarket.problemservice.adapter.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtManager jwtManager;

	@InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("유효한 JWT 토큰과 함께 요청 시, SecurityContext에 인증 정보가 저장된다")
    void doFilterInternal_withValidToken_shouldSetAuthentication() throws ServletException, IOException {
        // given
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        var filterChain = mock(FilterChain.class);

        String token = "valid-jwt-token";
        request.addHeader("Authorization", "Bearer " + token);

        doNothing().when(jwtManager).authenticate(token);
        given(jwtManager.extractUsername(token)).willReturn("testUser");

        // when
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // then
        var resultAuth = SecurityContextHolder.getContext().getAuthentication();
		var userPrincipal = (UserPrincipal) resultAuth.getPrincipal();

        assertThat(resultAuth).isNotNull();
		assertThat(userPrincipal.username()).isEqualTo("testUser");

        verify(jwtManager).authenticate(token);
        verify(jwtManager).extractUsername(token);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("유효하지 않은 JWT 토큰과 함께 요청 시, SecurityContext가 비어있다")
    void doFilterInternal_withInvalidToken_shouldNotSetAuthentication() throws ServletException, IOException {
        // given
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        var filterChain = mock(FilterChain.class);

        String token = "invalid-jwt-token";
        request.addHeader("Authorization", "Bearer " + token);

        doThrow(new JwtException("Invalid Token")).when(jwtManager).authenticate(token);

        // when
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // then
        var resultAuth = SecurityContextHolder.getContext().getAuthentication();
		assertThat(resultAuth).isNull();

        verify(jwtManager, never()).extractUsername(anyString());
        verify(filterChain).doFilter(request, response);
    }
}
