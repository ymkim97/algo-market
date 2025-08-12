package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.member.MemberFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class MemberFinderTest {

	@Autowired
	MemberFinder memberFinder;

	@Autowired
	MemberRegister memberRegister;

	@Autowired
	EntityManager entityManager;

	@Test
	void find() {
		var createRequest = MemberFixture.createMemberRegisterRequest();
		var memberInfoResponse = memberRegister.register(createRequest);
		entityManager.flush();
		entityManager.clear();

		var found = memberFinder.find(memberInfoResponse.username());

		assertThat(found).isNotNull();
	}
}
