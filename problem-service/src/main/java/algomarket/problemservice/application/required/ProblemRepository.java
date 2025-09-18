package algomarket.problemservice.application.required;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import algomarket.problemservice.application.dto.ProblemListResponse;
import algomarket.problemservice.domain.problem.Problem;

public interface ProblemRepository extends Repository<Problem, Long> {

	Problem save(Problem problem);

	Optional<Problem> findById(Long problemId);

	Optional<Problem> findByNumber(Long problemNumber);

	Optional<Problem> findByTitle(String title);

	Optional<Problem> findByIdAndAuthorUsername(Long id, String authorUsername);

	@Query("SELECT new algomarket.problemservice.application.dto.ProblemListResponse(p.number, p.title, p.submitCount) FROM Problem p WHERE p.problemStatus = algomarket.problemservice.domain.problem.ProblemStatus.PUBLIC")
	Page<ProblemListResponse> findAll(Pageable pageable);

	@Query("SELECT p from Problem p WHERE p.authorUsername = :authorUsername")
	Page<Problem> findAllMyProblems(Pageable pageable, String authorUsername);

	@Query("SELECT MAX(p.number) FROM Problem p WHERE p.problemStatus = algomarket.problemservice.domain.problem.ProblemStatus.PUBLIC")
	Long findMaxProblemNumber();

	boolean existsByTitleAndIdNot(String title, Long problemId);

	boolean existsByIdAndAuthorUsername(Long problemId, String username);

	@Modifying
	@Query("DELETE FROM Problem p WHERE p.id = :problemId AND p.authorUsername = :username AND p.problemStatus = algomarket.problemservice.domain.problem.ProblemStatus.DRAFT")
	void deleteDraftProblem(Long problemId, String username);
}
