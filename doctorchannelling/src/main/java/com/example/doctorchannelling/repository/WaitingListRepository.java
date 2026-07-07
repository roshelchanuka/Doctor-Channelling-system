package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import com.example.doctorchannelling.model.WaitingList;
import java.util.List;


public interface WaitingListRepository extends JpaRepository<WaitingList, Integer> {
    
    // To find the current maximum waiting queue number for a specific slot
    @Query("SELECT COALESCE(MAX(w.queuePosition), 0) FROM WaitingList w WHERE w.slot.slotId = :slotId")
    Integer findMaxQueuePositionBySlotId(@Param("slotId") Integer slotId);

    List<WaitingList> findByPatient_PatientId(Integer patientId);
}
