package algomarket.problemservice.adapter.security;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;

class JwtManagerTest {

	static JwtManager jwtManager;
	static SecretKey testSecretKey;

	@BeforeAll
	static void setUp() {
		testSecretKey = Jwts.SIG.HS256.key().build();
		String testKey = Base64.getEncoder().encodeToString(testSecretKey.getEncoded());

		jwtManager = new JwtManager();
		ReflectionTestUtils.setField(jwtManager, "key", testKey);
		jwtManager.init();
	}

	@Test
	void authenticate() {
		String expiredToken = Jwts.builder()
			.subject("testUser")
			.expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
			.signWith(testSecretKey)
			.compact();

		jwtManager.authenticate(expiredToken);
	}

	@Test
	void authenticate_withExpiredToken_fail() {
		String expiredToken = Jwts.builder()
		 .subject("testUser")
		 .expiration(new Date(System.currentTimeMillis() - 1000))
		 .signWith(testSecretKey)
		 .compact();


		assertThatThrownBy(() -> jwtManager.authenticate(expiredToken))
		    .isInstanceOf(ExpiredJwtException.class);
	}
}
