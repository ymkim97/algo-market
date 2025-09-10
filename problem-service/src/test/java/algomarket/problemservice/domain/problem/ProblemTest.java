package algomarket.problemservice.domain.problem;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ProblemTest {

	@Test
	void create() {
		var request = ProblemFixture.createProblemCreateRequest();

		Problem problem = Problem.create(request, "username");

		assertThat(problem.getSubmitCount()).isZero();
		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.DRAFT);
	}

	@ParameterizedTest
	@CsvSource(value = {"0.0, 512", "1.0, 0", "101.0, 1024", "10.0, 5121", "-1.0, -1"})
	void create_withLimitSettings_fail(Double timeLimit, Integer memoryLimit) {
		var requestWithInvalidLimit = ProblemFixture.createProblemCreateRequest(timeLimit, memoryLimit);

		assertThatThrownBy(() -> Problem.create(requestWithInvalidLimit, "username")).isInstanceOf(IllegalStateException.class);
	}
}
