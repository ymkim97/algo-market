package algomarket.problemservice.adapter.webapi;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

import java.io.UnsupportedEncodingException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import algomarket.problemservice.application.provided.ProblemCreator;
import algomarket.problemservice.application.required.ProblemRepository;
import algomarket.problemservice.application.required.SubmissionRepository;
import algomarket.problemservice.domain.problem.Problem;
import algomarket.problemservice.domain.problem.ProblemFixture;
import algomarket.problemservice.domain.problem.ProblemInfoResponse;
import algomarket.problemservice.domain.problem.ProblemStatus;
import algomarket.problemservice.domain.shared.Language;
import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitRequest;
import algomarket.problemservice.domain.submission.SubmitStatus;

@SpringBootTest
@Transactional
@AutoConfigureMockMvc
class ProblemApiTest {

	@Autowired
	MockMvcTester mockMvcTester;

	@Autowired
	ProblemCreator problemCreator;

	@Autowired
	SubmissionRepository submissionRepository;

	@Autowired
	ProblemRepository problemRepository;

	@Autowired
	ObjectMapper objectMapper;

	@Test
	@WithMockUser
	void create() throws JsonProcessingException, UnsupportedEncodingException {
		var request = ProblemFixture.createProblemCreateRequest();

		var result = mockMvcTester.post().uri("/problems").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.problemId", value -> assertThat(value).isNotNull())
			.hasPathSatisfying("$.title", value -> assertThat(value).isEqualTo(request.title()));

		ProblemInfoResponse response =
			objectMapper.readValue(result.getResponse().getContentAsString(), ProblemInfoResponse.class);
		Problem problem = problemRepository.findById(response.problemId()).orElseThrow();

		assertThat(problem.getId()).isEqualTo(response.problemId());
		assertThat(problem.getTitle()).isEqualTo(request.title());
		assertThat(problem.getDescription()).isEqualTo(request.description());
		assertThat(problem.getSubmitCount()).isZero();
	}

	@Test
	@WithMockUser
	void create_withDuplicateTitle_fail() throws JsonProcessingException {
		var request = ProblemFixture.createProblemCreateRequest();
		problemCreator.create(request, "username");

		var result = mockMvcTester.post().uri("/problems").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(request)).exchange();

		assertThat(result)
			.apply(print())
			.hasStatus(HttpStatus.CONFLICT);
	}

	@Test
	@WithMockUser(username = "username")
	void findMyProblem() {
		var problemInfoResponse = problemCreator.create(ProblemFixture.createProblemCreateRequest(), "username");
		Long problemId = problemInfoResponse.problemId();

		var result = mockMvcTester.get().uri("/problems/my/{problemId}", problemId).contentType(MediaType.APPLICATION_JSON)
			.exchange();

		assertThat(result)
			.hasStatus(HttpStatus.OK)
			.bodyJson()
			.hasPathSatisfying("$.problemId", value -> assertThat(value).isEqualTo(problemInfoResponse.problemId().intValue()))
			.hasPathSatisfying("$.title", value -> assertThat(value).isEqualTo(problemInfoResponse.title()));
	}

	@Test
	@WithMockUser(username = "username")
	void initiateUpload() throws JsonProcessingException {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfoResponse = problemCreator.create(problemCreateRequest, "username");

		var initiateUploadRequest = ProblemFixture.createInitiateUploadRequest(problemInfoResponse.problemId());

		// when
		var result = mockMvcTester.post().uri("/problems/initiate-upload").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(initiateUploadRequest)).exchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.CREATED)
			.bodyJson()
			.hasPathSatisfying("$.key", value -> assertThat(value).isNotNull())
			.hasPathSatisfying("$.presignedUrl", value -> assertThat(value).isNotNull());
	}

	@Test
	@WithMockUser(username = "username")
	void initiateUpload_withInvalidFile_fail() throws JsonProcessingException {
		// given
		var problemCreateRequest = ProblemFixture.createProblemCreateRequest();
		var problemInfoResponse = problemCreator.create(problemCreateRequest, "username");

		var initiateUploadRequest = ProblemFixture.createInitiateUploadRequest("wrongFile.abc", problemInfoResponse.problemId());

		// when
		var result = mockMvcTester.post().uri("/problems/initiate-upload").contentType(MediaType.APPLICATION_JSON)
			.content(objectMapper.writeValueAsString(initiateUploadRequest)).exchange();

		assertThat(result)
			.hasStatus(HttpStatus.BAD_REQUEST);
	}

	@Test
	@WithMockUser(username = "author")
	void publishMyProblem() {
		// given
		String username = "author";
		var problemInfoResponse = problemCreator.create(ProblemFixture.createProblemCreateRequest(), username);
		Long problemId = problemInfoResponse.problemId();

		var submitRequest1 = new SubmitRequest(problemId, "CODE", Language.JAVA);
		var submitRequest2 = new SubmitRequest(problemId, "CODE", Language.PYTHON);

		var submission1 = Submission.submit(submitRequest1, username);
		var submission2 = Submission.submit(submitRequest2, username);

		ReflectionTestUtils.setField(submission1, "submitStatus", SubmitStatus.ACCEPTED);
		ReflectionTestUtils.setField(submission2, "submitStatus", SubmitStatus.ACCEPTED);

		problemRepository.findById(problemId).orElseThrow();

		submissionRepository.save(submission1);
		submissionRepository.save(submission2);

		// when
		var result = mockMvcTester.put().uri("/problems/publish/{problemId}", problemId).exchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.OK);

		Problem problem = problemRepository.findById(problemId).orElseThrow();

		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.PUBLIC);
	}

	@Test
	@WithMockUser(username = "author")
	void publishMyProblem_withInsufficientSolve_fail() {
		// given
		String username = "author";
		var problemInfoResponse = problemCreator.create(ProblemFixture.createProblemCreateRequest(), username);
		Long problemId = problemInfoResponse.problemId();

		var submitRequest1 = new SubmitRequest(problemId, "CODE", Language.JAVA);

		var submission1 = Submission.submit(submitRequest1, username);

		ReflectionTestUtils.setField(submission1, "submitStatus", SubmitStatus.ACCEPTED);

		submissionRepository.save(submission1);

		// when
		var result = mockMvcTester.put().uri("/problems/publish/{problemId}", problemId).exchange();

		// then
		assertThat(result)
			.hasStatus(HttpStatus.BAD_REQUEST);

		Problem problem = problemRepository.findById(problemId).orElseThrow();

		assertThat(problem.getProblemStatus()).isEqualTo(ProblemStatus.DRAFT);
	}
}
