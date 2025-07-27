package algomarket.problemservice.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ProblemTest {

	@Test
	void createProblem() {
		ProblemCreateRequest request = new ProblemCreateRequest("ABC Title", "This is description");

		Problem problem = Problem.create(request);

		assertThat(problem.getSubmitCount()).isZero();
		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.INSPECTING);
	}
}
