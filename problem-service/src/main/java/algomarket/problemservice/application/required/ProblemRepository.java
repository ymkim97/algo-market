package algomarket.problemservice.application.required;

import java.util.Optional;

import org.springframework.data.repository.Repository;

import algomarket.problemservice.domain.problem.Problem;

public interface ProblemRepository extends Repository<Problem, Long> {

	Problem save(Problem problem);

	Optional<Problem> findById(Long problemId);

	boolean existsByTitle(String title);
}
