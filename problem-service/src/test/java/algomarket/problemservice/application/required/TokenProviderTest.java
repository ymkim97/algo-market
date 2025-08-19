package algomarket.problemservice.application.required;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TokenProviderTest {

	@Autowired
	TokenProvider tokenProvider;

	@Test
	void createToken() {
		String subject = "username";

		String token = tokenProvider.createToken(subject);

		assertThat(token).isNotNull();
	}
}
