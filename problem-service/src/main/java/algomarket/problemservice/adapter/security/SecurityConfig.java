package algomarket.problemservice.adapter.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;

	@Value("${cors.allowed-origins}")
	private String allowedOrigins;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(AbstractHttpConfigurer::disable)
		 	.formLogin(AbstractHttpConfigurer::disable)
			.logout(AbstractHttpConfigurer::disable)
			.httpBasic(AbstractHttpConfigurer::disable)
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.cors(cors -> cors.configurationSource(corsConfigurationSource()))

			.authorizeHttpRequests(authorizeRequests -> authorizeRequests
			.requestMatchers(HttpMethod.GET, "/").permitAll()
			.requestMatchers(HttpMethod.POST, "/login").permitAll()
			.requestMatchers(HttpMethod.POST, "/members").permitAll()
			.requestMatchers(HttpMethod.GET, "/problems").permitAll()
			.requestMatchers(HttpMethod.GET, "/problems/{id:\\d+}").permitAll()
			.requestMatchers(HttpMethod.GET, "/submissions/*/progress").permitAll()
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

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();

		// 환경변수로 다중 Origin 지원 (쉼표로 구분)
		String[] origins = allowedOrigins.split(",");
		configuration.setAllowedOrigins(Arrays.asList(origins));

		configuration.addAllowedMethod("GET");
		configuration.addAllowedMethod("POST");
		configuration.addAllowedMethod("PUT");
		configuration.addAllowedMethod("DELETE");
		configuration.addAllowedMethod("OPTIONS");
		configuration.addAllowedHeader("*");
		configuration.addExposedHeader("Authorization");
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
