package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.application.dto.ProblemInfoResponse;
import algomarket.problemservice.domain.ProblemFixture;
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
	void find() {
		var createRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfoResponse = problemCreator.create(createRequest);
		entityManager.flush();
		entityManager.clear();

		ProblemInfoResponse found = problemFinder.find(problemInfoResponse.id());

		assertThat(found.id()).isEqualTo(problemInfoResponse.id());
	}

	@Test
	void findFail() {
		assertThatThrownBy(() -> problemFinder.find(999L)).isInstanceOf(IllegalArgumentException.class);
	}
}
