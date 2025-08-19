package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.problem.DuplicateTitleException;
import algomarket.problemservice.domain.problem.ProblemFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class ProblemCreatorTest {

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	EntityManager entityManager;

	@Test
	void create() {
		var request = ProblemFixture.createProblemCreateRequest();

		var problemInfoResponse = problemCreator.create(request);
		entityManager.flush();

		assertThat(problemInfoResponse.problemId()).isNotNull();
		assertThat(problemInfoResponse.submitCount()).isZero();
	}

	@Test
	void create_withDuplicateTitle_fail() {
		var firstRequest = ProblemFixture.createProblemCreateRequest("ABC", 1.5, 1024);
		var secondRequest = ProblemFixture.createProblemCreateRequest("ABC", 1.0, 512);
		problemCreator.create(firstRequest);

		entityManager.flush();
		entityManager.clear();

		assertThatThrownBy(() -> problemCreator.create(secondRequest)).isInstanceOf(DuplicateTitleException.class);
	}
}
