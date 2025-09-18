package algomarket.problemservice.application.required;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import algomarket.problemservice.application.dto.SubmissionHistoryForProblemResponse;
import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitStatus;

public interface SubmissionRepository extends Repository<Submission, Long> {

	Submission save(Submission submission);

	Optional<Submission> findById(Long id);

	Boolean existsByUsernameAndIdAndSubmitStatus(String username, Long id,  SubmitStatus status);

	List<Submission> findAllByProblemIdAndUsername(Long problemId, String username);

	@Query("SELECT s.problemId, s.language FROM Submission s WHERE s.problemId IN :problemId AND s.submitStatus = algomarket.problemservice.domain.submission.SubmitStatus.ACCEPTED")
	List<Object[]> findSolvedLanguagesForDraftByProblemId(List<Long> problemId);

	@Query("SELECT new algomarket.problemservice.application.dto.SubmissionHistoryForProblemResponse(s.id, s.problemId, s.username, s.submitStatus, s.sourceCode, s.language, s.runtimeMs, s.memoryKb, s.submitTime) "
		+ "FROM Submission s WHERE s.problemId = :problemId AND s.username = :username")
	Page<SubmissionHistoryForProblemResponse> findHistoryForProblem(Pageable pageable, Long problemId, String username);
}
