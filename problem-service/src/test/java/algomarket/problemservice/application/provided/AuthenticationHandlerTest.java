package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.application.dto.LoginRequest;
import algomarket.problemservice.domain.member.MemberFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class AuthenticationHandlerTest {

	@Autowired
	AuthenticationHandler authenticationHandler;

	@Autowired
	MemberRegister memberRegister;

	@Autowired
	EntityManager entityManager;

	@Test
	void login() {
		// given
		var registerRequest = MemberFixture.createMemberRegisterRequest();
		memberRegister.register(registerRequest);
		entityManager.flush();
		entityManager.clear();

		var loginRequest = new LoginRequest(registerRequest.username(), registerRequest.password());

		// when
		String token = authenticationHandler.login(loginRequest);

		// then
		assertThat(token).isNotNull();
	}
}
