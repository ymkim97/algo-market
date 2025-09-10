package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.application.NotFoundException;
import algomarket.problemservice.domain.problem.ProblemFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class ProblemFinderTest {

	@Autowired
	ProblemFinder problemFinder;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	EntityManager entityManager;

	@Test
	void findMyProblem() {
		String username = "username";
		var createRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfoResponse = problemCreator.create(createRequest, username);
		entityManager.flush();
		entityManager.clear();

		var foundResponse = problemFinder.findMyProblem(problemInfoResponse.problemId(), username);

		assertThat(foundResponse.problemId()).isEqualTo(problemInfoResponse.problemId());
	}

	@Test
	void find_fail() {
		assertThatThrownBy(() -> problemFinder.find(999L)).isInstanceOf(NotFoundException.class);
	}
}
