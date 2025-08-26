package algomarket.problemservice.adapter.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(AbstractHttpConfigurer::disable)
		 	.formLogin(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

			.authorizeHttpRequests(authorizeRequests -> authorizeRequests
			.requestMatchers(HttpMethod.POST, "/login").permitAll()
			.requestMatchers(HttpMethod.POST, "/members").permitAll()
			.requestMatchers(HttpMethod.GET, "/problems/**").permitAll()
			.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
			.anyRequest().authenticated())

			.exceptionHandling(ex -> ex
				.authenticationEntryPoint((request, response, authException) -> {
					log.error("Authentication Failure", authException);
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setContentType("application/json;charset=UTF-8");
					response.getWriter().write("{\"error\":\"Unauthorized\"}");
				})

			.accessDeniedHandler((request, response, accessDeniedException) -> {
				log.error("Authentication Failure", accessDeniedException);
				response.setStatus(HttpServletResponse.SC_NOT_FOUND);
				response.setContentType("application/json;charset=UTF-8");
				response.getWriter().write("{\"error\":\"Not Found\"}");
				})
			)

			.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
		;

		return http.build();
	}
}
