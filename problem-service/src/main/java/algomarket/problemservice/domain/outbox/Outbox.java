package algomarket.problemservice.domain.outbox;

import java.time.LocalDateTime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Outbox {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private Long aggregateId;

	@Column(nullable = false)
	private String aggregateType;

	@Column(nullable = false, columnDefinition = "MEDIUMTEXT")
	private String payload;

	@Column(nullable = false)
	private LocalDateTime timeStamp;

	public static Outbox create(Long aggregateId, String aggregateType, Object payload, ObjectMapper objectMapper) {
		try {
			Outbox outbox = new Outbox();
			String payloadJson = objectMapper.writeValueAsString(payload);

			outbox.aggregateId =  aggregateId;
			outbox.aggregateType = aggregateType;
			outbox.payload = payloadJson;
			outbox.timeStamp = LocalDateTime.now();

			return outbox;
		} catch (JsonProcessingException e) {
			throw new RuntimeException("Failed to serialize event data", e);
		}
	}
}
