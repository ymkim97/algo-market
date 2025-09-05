package algomarket.problemservice.application.required;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.repository.Repository;

import algomarket.problemservice.domain.outbox.Outbox;

public interface OutboxRepository extends Repository<Outbox, Long> {

	Outbox save(Outbox message);

	void deleteByAggregateId(Long aggregateId);

	List<Outbox> findTop100ByTimeStampBeforeOrderByTimeStampAsc(LocalDateTime threshold);

	boolean existsByAggregateId(Long aggregateId);
}
