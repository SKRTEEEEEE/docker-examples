import { Reorder } from "framer-motion";
import { useEffect, useState } from "react";
import {NoteFull,  NotesFull } from "../types";

type TabProps = {
  notes: NotesFull;
  setEditNote: (item: NoteFull)=>void
  itemsStart?: number;
  itemsEnd?: number;
};

function Tab({ notes, itemsStart, itemsEnd, setEditNote }: TabProps) {
    const start = itemsStart ? itemsStart : 0;
    const [items, setItems] = useState<NotesFull>([]);

    useEffect(() => {
      // Actualiza los items solo cuando notes, itemsStart o itemsEnd cambien
      setItems(itemsEnd ? notes.slice(start, itemsEnd) : notes);
    }, [notes, itemsStart, itemsEnd, start]);
  return (
    <div className="w-full">
      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        {items.map((item) => (
          <Reorder.Item key={item.id} value={item}>
            <div className="flex w-full h-full">
              <div className="bg-green-300 w-4 h-16 my-2 mx-2 rounded-sm"></div>
              <div className="w-full">
                <div className=" flex justify-between w-full pr-6">
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p>{item.updatedAt.split("T")[0]}</p>
                </div>
                <div className="flex w-full justify-between pr-2">
                <p className="text-xs">{item.desc}</p>
                <button 
                onClick={()=>{
                    setEditNote(item)
                }}
                className="bg-black/85 border-black border-2 text-white py-1 w-24 rounded-lg">✏️ Editar</button>
                </div>

              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

export default Tab;
