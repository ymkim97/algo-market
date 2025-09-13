package algomarket.problemservice.adapter.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtManager jwtManager;
	private final AntPathMatcher pathMatcher =  new AntPathMatcher();

	private final List<IgnoreRule> ignoreRules = List.of(
		new IgnoreRule("POST", "/login"),
		new IgnoreRule("POST", "/members"),
		new IgnoreRule("GET", "/problems/{id:[0-9]+}"),
		new IgnoreRule("OPTIONS", "/**") // CORS preflight
	);

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String requestUri = request.getRequestURI();
		String method = request.getMethod();

		return ignoreRules.stream()
			.anyMatch(rule -> rule.method.equalsIgnoreCase(method) && pathMatcher.match(rule.pattern, requestUri));
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
		FilterChain filterChain) throws ServletException, IOException {

		String token = resolveToken(request);

		if (StringUtils.hasText(token)) {
			try {
				jwtManager.authenticate(token);
				String username = jwtManager.extractUsername(token);

				UserPrincipal userPrincipal = new UserPrincipal(username);
				Authentication authentication =
					new UsernamePasswordAuthenticationToken(userPrincipal, null, List.of(new SimpleGrantedAuthority("USER")));

				SecurityContextHolder.getContext().setAuthentication(authentication);
			} catch (JwtException e) {
				log.error("Something went wrong while authenticating the token", e);
			}
		}

		filterChain.doFilter(request, response);
	}

	private String resolveToken(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");

		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}

		return null;
	}

	private record IgnoreRule(String method, String pattern) {}
}
