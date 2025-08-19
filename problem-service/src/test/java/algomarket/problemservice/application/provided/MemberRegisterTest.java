package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.member.DuplicateEmailException;
import algomarket.problemservice.domain.member.DuplicateUsernameException;
import algomarket.problemservice.domain.member.MemberFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class MemberRegisterTest {

	@Autowired
	MemberRegister memberRegister;

	@Autowired
	EntityManager entityManager;

	@Test
	void register() {
		var registerRequest = MemberFixture.createMemberRegisterRequest();

		var memberInfoResponse = memberRegister.register(registerRequest);
		entityManager.flush();

		assertThat(memberInfoResponse.memberId()).isNotNull();
		assertThat(memberInfoResponse.email()).isEqualTo(registerRequest.email());
		assertThat(memberInfoResponse.username()).isEqualTo(registerRequest.username());
	}

	@Test
	void register_withNullEmail() {
		var registerRequest = MemberFixture.createMemberRegisterRequest(null);

		var memberInfoResponse = memberRegister.register(registerRequest);
		entityManager.flush();

		assertThat(memberInfoResponse.memberId()).isNotNull();
		assertThat(memberInfoResponse.email()).isEqualTo(registerRequest.email());
		assertThat(memberInfoResponse.username()).isEqualTo(registerRequest.username());
	}

	@Test
	void register_withDuplicateEmail_fail() {
		var registerRequest1 = MemberFixture.createMemberRegisterRequest("abc@gmail.com");
		memberRegister.register(registerRequest1);
		entityManager.flush();
		entityManager.clear();

		assertThatThrownBy(() -> memberRegister.register(registerRequest1))
		    .isInstanceOf(DuplicateEmailException.class);
	}

	@Test
	void register_withDuplicateUsername_fail() {
		var request1 = MemberFixture.createMemberRegisterRequest("hello@gmail.com", "user");
		memberRegister.register(request1);
		entityManager.flush();
		entityManager.clear();

		var request2 = MemberFixture.createMemberRegisterRequest("world@naver.com", "user");

		assertThatThrownBy(() -> memberRegister.register(request2))
		    .isInstanceOf(DuplicateUsernameException.class);
	}
}
