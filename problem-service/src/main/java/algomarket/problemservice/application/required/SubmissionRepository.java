package algomarket.problemservice.application.required;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import algomarket.problemservice.domain.submission.Submission;
import algomarket.problemservice.domain.submission.SubmitStatus;

public interface SubmissionRepository extends Repository<Submission, Long> {

	Submission save(Submission submission);

	Optional<Submission> findById(Long id);

	Boolean existsByUsernameAndIdAndSubmitStatus(String username, Long id,  SubmitStatus status);

	List<Submission> findAllByProblemIdAndUsername(Long problemId, String username);

	@Query("SELECT s.problemId, s.language FROM Submission s WHERE s.problemId IN :problemId AND s.submitStatus = algomarket.problemservice.domain.submission.SubmitStatus.ACCEPTED")
	List<Object[]> findSolvedLanguagesForDraftByProblemId(List<Long> problemId);
}
