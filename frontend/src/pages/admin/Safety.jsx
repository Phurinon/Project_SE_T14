import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useDusthStore from "../../Global Store/DusthStore";
import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import {
  getAllSafetyLevels,
  createSafetyLevel,
  updateSafetyLevel,
  deleteSafetyLevel,
} from "../../api/safetyLevels";

export default function Safety() {
  const { token } = useDusthStore();
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    const fetchSafetyLevels = async () => {
      try {
        const safetyLevels = await getAllSafetyLevels();
        setLevels(safetyLevels);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch safety levels");
      }
    };
    fetchSafetyLevels();
  }, []);

  const handleUpdateLevel = async (id, field, value) => {
    try {
      const updatedLevel = await updateSafetyLevel(token, id, {
        [field]: value,
      });
      setLevels(
        levels.map((level) => (level.id === id ? updatedLevel : level))
      );
    } catch (error) {
      console.error("Failed to update safety level", error);
      toast.error("Failed to update safety level");
    }
  };

  const handleAddLevel = async () => {
    const newLevel = {
      label: "ระดับใหม่",
      maxValue: 0,
      color: "#000000",
      description: "",
    };
    try {
      const createdLevel = await createSafetyLevel(token, newLevel);
      setLevels([...levels, createdLevel]);
      toast.success("New level added!");
    } catch (error) {
      console.error(
        "Failed to create new safety level",
        error.response?.data || error
      );
      toast.error("Failed to create new safety level");
    }
  };

  const handleDeleteLevel = async (id) => {
    try {
      await deleteSafetyLevel(token, id);
      setLevels(levels.filter((level) => level.id !== id));
      toast.success("Deleted successfully!");
    } catch (error) {
      console.error("Failed to delete safety level", error);
      toast.error("Failed to delete safety level");
    }
  };

  const handleSaveChanges = () => {
    toast.success("บันทึกการเปลี่ยนแปลงเรียบร้อย");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Safety Levels</h2>
        <div className="flex gap-2">
          <button
            onClick={handleAddLevel}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มระดับ
            </div>
          </button>
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              บันทึกการเปลี่ยนแปลง
            </div>
          </button>
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">ตั้งค่าระดับค่า PM2.5</h3>
        </div>
        <div className="p-4 space-y-4">
          {levels.map((level) => (
            <div key={level.id} className="p-4 border rounded-lg">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ระดับ
                  </label>
                  <input
                    type="text"
                    value={level.label}
                    onChange={(e) =>
                      handleUpdateLevel(level.id, "label", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    ค่าสูงสุด (µg/m³)
                  </label>
                  <input
                    type="number"
                    value={level.maxValue}
                    onChange={(e) =>
                      handleUpdateLevel(
                        level.id,
                        "maxValue",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    สี
                  </label>
                  <input
                    type="color"
                    value={level.color}
                    onChange={(e) =>
                      handleUpdateLevel(level.id, "color", e.target.value)
                    }
                    className="w-full p-1 border rounded h-10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    คำอธิบาย
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={level.description}
                      onChange={(e) =>
                        handleUpdateLevel(
                          level.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => handleDeleteLevel(level.id)}
                      className="p-2 text-red-600 border rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg bg-white shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">ตัวอย่างการแสดงผล</h3>
        </div>
        <div className="p-4 grid gap-4 md:grid-cols-4">
          {levels.map((level) => (
            <div
              key={level.id}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${level.color}20`,
                borderColor: level.color,
                borderWidth: 1,
              }}
            >
              <div className="font-medium" style={{ color: level.color }}>
                {level.label}
              </div>
              <div className="text-sm text-gray-600">
                {"<"} {level.maxValue} µg/m³
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
