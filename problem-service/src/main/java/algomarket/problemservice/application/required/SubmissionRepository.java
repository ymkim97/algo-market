package algomarket.problemservice.application.required;

import java.util.Optional;

import org.springframework.data.repository.Repository;

import algomarket.problemservice.domain.submission.Submission;

public interface SubmissionRepository extends Repository<Submission, Long> {

	Submission save(Submission submission);

	Optional<Submission> findById(Long id);
}
