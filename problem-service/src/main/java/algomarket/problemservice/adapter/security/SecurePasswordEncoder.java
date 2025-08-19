package algomarket.problemservice.adapter.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import algomarket.problemservice.domain.member.PasswordEncoder;

@Component
public class SecurePasswordEncoder implements PasswordEncoder {

	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@Override
	public String encode(String password) {
		return passwordEncoder.encode(password);
	}

	@Override
	public boolean matches(String password, String passwordHash) {
		return passwordEncoder.matches(password, passwordHash);
	}
}
