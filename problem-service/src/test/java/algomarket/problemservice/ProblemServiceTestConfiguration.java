package algomarket.problemservice;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import algomarket.problemservice.domain.member.PasswordEncoder;

@TestConfiguration
public class ProblemServiceTestConfiguration {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new PasswordEncoder() {

			@Override
			public String encode(String password) {
				return "Hashed" + password.toUpperCase();
			}

			@Override
			public boolean matches(String password, String passwordHash) {
				return encode(password).equals(passwordHash);
			}
		};
	}
}
