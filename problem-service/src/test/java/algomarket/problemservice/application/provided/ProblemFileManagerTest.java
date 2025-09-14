package algomarket.problemservice.application.provided;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import algomarket.problemservice.domain.problem.ProblemFixture;
import jakarta.persistence.EntityManager;

@SpringBootTest
@Transactional
class ProblemFileManagerTest {

	@Autowired
	ProblemFileManager problemFileManager;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	EntityManager entityManager;

	@Test
	void initiateUpload() {
		// given
		var problemInfoResponse = problemCreator.create(ProblemFixture.createProblemCreateRequest(), "username");
		entityManager.flush();
		entityManager.clear();

		var initiateUploadRequest = ProblemFixture.createInitiateUploadRequest(problemInfoResponse.problemId());

		// when
		var initiateUploadResponse = problemFileManager.initiateUpload(initiateUploadRequest, "username");

		// then
		assertThat(initiateUploadResponse.key()).isNotNull();
		assertThat(initiateUploadResponse.presignedUrl()).isNotNull();
	}
}
