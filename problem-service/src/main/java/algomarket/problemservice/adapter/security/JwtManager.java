package algomarket.problemservice.adapter.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import algomarket.problemservice.application.required.TokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;

@Component
public class JwtManager implements TokenProvider {

	@Value("${jwt.key}")
	private String key;

	private SecretKey secretKey;

	@PostConstruct
	public void init() {
		byte[] decodedKey = Base64.getDecoder().decode(key);
		secretKey = new SecretKeySpec(decodedKey, "HmacSHA256");
	}

	public void authenticate(String token) throws JwtException {
		Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
	}

	public String extractUsername(String token) throws JwtException {
		Jws<Claims> claims = Jwts.parser().build().parseSignedClaims(token);

		return claims.getPayload().getSubject();
	}

	@Override
	public String createToken(String subject) {
		Duration expireDuration = Duration.ofDays(7);
		Instant now = Instant.now();
		Instant expireAt = now.plus(expireDuration);

		return Jwts.builder()
			.header()
			.add("alg", "HS256")
			.type("JWT")
			.and()
			.subject(subject)
			.signWith(secretKey)
			.expiration(Date.from(expireAt))
			.compact();
	}
}
