package algomarket.problemservice.application.required;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import algomarket.problemservice.application.dto.MyProblemInfoResponse;
import algomarket.problemservice.application.dto.ProblemListResponse;
import algomarket.problemservice.domain.problem.Problem;

public interface ProblemRepository extends Repository<Problem, Long> {

	Problem save(Problem problem);

	Optional<Problem> findById(Long problemId);

	Optional<Problem> findByNumber(Long problemNumber);

	Optional<Problem> findByIdAndAuthorUsername(Long id, String authorUsername);

	@Query("SELECT new algomarket.problemservice.application.dto.ProblemListResponse(p.number, p.title, p.submitCount) FROM Problem p WHERE p.problemStatus = algomarket.problemservice.domain.problem.ProblemStatus.PUBLIC")
	Page<ProblemListResponse> findAll(Pageable pageable);

	@Query("SELECT new algomarket.problemservice.application.dto.MyProblemInfoResponse(p.id, p.number, p.title, p.description, p.submitCount, p.timeLimitSec, p.memoryLimitMb, p.problemStatus, p.exampleTestCases, p.testCaseUrls) FROM Problem p WHERE p.authorUsername = :authorUsername")
	Page<MyProblemInfoResponse> findAllMyProblems(Pageable pageable, String authorUsername);

	@Query("SELECT MAX(p.number) FROM Problem p WHERE p.problemStatus = algomarket.problemservice.domain.problem.ProblemStatus.PUBLIC")
	Long findMaxProblemNumber();

	boolean existsByTitleAndIdNot(String title, Long problemId);

	boolean existsByIdAndAuthorUsername(Long problemId, String username);
}
