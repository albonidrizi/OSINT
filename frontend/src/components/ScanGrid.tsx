import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScanResponse } from '../services/api';
import { ScanCard } from './ScanCard';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import './ScanGrid.css';

interface ScanGridProps {
  scans: ScanResponse[];
  onViewResults: (scan: ScanResponse) => void;
}

interface SortableItemProps {
  scan: ScanResponse;
  onViewResults: (scan: ScanResponse) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ scan, onViewResults }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scan.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="drag-handle" {...listeners}>
        <span className="drag-icon">⋮⋮</span>
      </div>
      <ScanCard scan={scan} onViewResults={onViewResults} />
    </div>
  );
};

export const ScanGrid: React.FC<ScanGridProps> = ({ scans, onViewResults }) => {
  const { orderedScans, updateOrder } = useDragAndDrop(scans);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedScans.findIndex((scan) => scan.id === active.id);
      const newIndex = orderedScans.findIndex((scan) => scan.id === over.id);

      const newOrder = arrayMove(orderedScans, oldIndex, newIndex);
      updateOrder(newOrder.map((scan) => scan.id));
    }
  };

  if (orderedScans.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h2>No scans yet</h2>
        <p>Initiate your first scan to get started!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedScans.map((scan) => scan.id)}
        strategy={rectSortingStrategy}
      >
        <div className="scan-grid">
          {orderedScans.map((scan) => (
            <SortableItem
              key={scan.id}
              scan={scan}
              onViewResults={onViewResults}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
